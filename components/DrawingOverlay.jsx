import React, { useState, useEffect, useRef } from "react"
import { StyleSheet, View, TouchableOpacity, Text } from "react-native"
import { Canvas, Path, Skia } from "@shopify/react-native-skia"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useSharedValue, runOnJS } from "react-native-reanimated"
import { AntDesign } from "@expo/vector-icons"

const DrawingOverlay = ({ 
  isDrawingMode, 
  onSaveDrawing, 
  onClose,
  existingPaths = [],
  width,
  height 
}) => {
  const [paths, setPaths] = useState([])
  const [livePath, setLivePath] = useState(null)
  const [color, setColor] = useState("#FF0000")
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [showTools, setShowTools] = useState(true)
  const [eraserMode, setEraserMode] = useState(false)
  const [eraserPoint, setEraserPoint] = useState(null)
  const [erasedIndices, setErasedIndices] = useState(new Set())
  const [renderTrigger, setRenderTrigger] = useState(0)  // Force canvas re-render

  const currentPath = useSharedValue(null)
  const pathsRef = useRef([])  // Keep ref in sync with paths state

  // Reconstruct Skia paths from stored data
  useEffect(() => {
    if (isDrawingMode && existingPaths && existingPaths.length > 0) {
      const reconstructedPaths = existingPaths
        .filter((p) => p && p.color && p.strokeWidth)
        .map((pathData) => {
          if (pathData.path && typeof pathData.path === 'object' && pathData.path.moveTo) {
            return pathData
          }
          if (pathData.svgPath) {
            try {
              const recreated = Skia.Path.MakeFromSVGString(pathData.svgPath)
              if (recreated) {
                return {
                  ...pathData,
                  path: recreated,
                }
              }
            } catch (e) {
              return null
            }
          }
          return null
        })
        .filter(Boolean)
      setPaths(reconstructedPaths)
      pathsRef.current = reconstructedPaths
    } else if (isDrawingMode && (!existingPaths || existingPaths.length === 0)) {
      setPaths([])
      pathsRef.current = []
    }
  }, [isDrawingMode, existingPaths])

  // Sync pathsRef whenever paths change
  useEffect(() => {
    pathsRef.current = paths
  }, [paths])

  const handleStartDrawing = (x, y, currentColor, currentStrokeWidth) => {
    'worklet'
    if (eraserMode) {
      return
    }
    const newPath = Skia.Path.Make()
    newPath.moveTo(x, y)
    currentPath.value = {
      path: newPath,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
    }
    runOnJS(setLivePath)({
      path: newPath,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
    })
  }

  const handleUpdateDrawing = (x, y) => {
    'worklet'
    if (eraserMode) {
      return
    }
    if (currentPath.value) {
      currentPath.value.path.lineTo(x, y)
      // Push a copy to state so React re-renders while drawing
      const copied = currentPath.value.path.copy()
      if (copied) {
        runOnJS(setLivePath)({
          path: copied,
          color: currentPath.value.color,
          strokeWidth: currentPath.value.strokeWidth,
        })
      }
    }
  }

  const handleEndDrawing = (pathData) => {
    // Convert Skia path to SVG path string for serialization
    if (pathData && pathData.path) {
      const svgPath = pathData.path.toSVGString ? pathData.path.toSVGString() : null
      const serializable = {
        color: pathData.color,
        strokeWidth: pathData.strokeWidth,
        svgPath: svgPath, // Store SVG representation
        path: pathData.path,
      }
      setPaths((prevPaths) => {
        const updated = [...prevPaths, serializable]
        pathsRef.current = updated
        return updated
      })
    }
    setLivePath(null)
  }

  const eraseAtPoint = (x, y) => {
    const tolerance = 12
    const newErased = new Set()
    
    // Use pathsRef to get current paths without waiting for state
    pathsRef.current.forEach((item, index) => {
      if (!item) return
      let p = item.path
      if (!p && item.svgPath) {
        try {
          p = Skia.Path.MakeFromSVGString(item.svgPath)
        } catch (e) {
          return
        }
      }
      if (!p) return
      const b = p.getBounds()
      if (
        x >= b.x - tolerance &&
        x <= b.x + b.width + tolerance &&
        y >= b.y - tolerance &&
        y <= b.y + b.height + tolerance
      ) {
        newErased.add(index)
      }
    })
    
    // Update state immediately for live visual feedback
    setErasedIndices(newErased)
    // Force canvas re-render
    setRenderTrigger(prev => prev + 1)
  }

  // Commit erased paths when gesture ends
  const commitErase = () => {
    setPaths((prev) =>
      prev.filter((_, index) => !erasedIndices.has(index))
    )
    setErasedIndices(new Set())
  }

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      if (eraserMode) {
        runOnJS(setEraserPoint)({ x: event.x, y: event.y })
        runOnJS(eraseAtPoint)(event.x, event.y)
      } else {
        handleStartDrawing(event.x, event.y, color, strokeWidth)
      }
    })
    .onUpdate((event) => {
      if (eraserMode) {
        runOnJS(setEraserPoint)({ x: event.x, y: event.y })
        runOnJS(eraseAtPoint)(event.x, event.y)
      } else {
        handleUpdateDrawing(event.x, event.y)
      }
    })
    .onEnd(() => {
      if (!eraserMode && currentPath.value) {
        runOnJS(handleEndDrawing)(currentPath.value)
        currentPath.value = null
      }
      if (eraserMode) {
        runOnJS(commitErase)()
        runOnJS(setLivePath)(null)
        runOnJS(setEraserPoint)(null)
      }
    })
    .enabled(isDrawingMode)

  const handleUndo = () => {
    setPaths((prevPaths) => {
      const updated = prevPaths.slice(0, -1)
      pathsRef.current = updated
      return updated
    })
    setLivePath(null)
  }

  const handleClear = () => {
    setPaths([])
    pathsRef.current = []
    currentPath.value = null
    setLivePath(null)
    setEraserPoint(null)
    setErasedIndices(new Set())
  }

  // If user toggles eraser off, keep current livePath untouched; no code needed here

  const handleSave = () => {
    onSaveDrawing(paths)
    onClose()
  }

  if (!isDrawingMode) {
    return null
  }

  const colors = ["#FF0000", "#000000", "#0000FF", "#00FF00", "#FFFF00", "#FFFFFF"]
  const strokeWidths = [2, 3, 5, 8]

  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents={isDrawingMode ? "auto" : "none"}>
      <GestureDetector gesture={panGesture}>
        <Canvas style={styles.canvas} pointerEvents={isDrawingMode ? "auto" : "none"}>
          {/* Render saved paths from this session - renderTrigger ensures live updates */}
          {paths.map((item, index) => {
            if (!item) return null
            if (!item.svgPath && !item.path) return null
            // Check if this path is being erased
            const isErased = erasedIndices.has(index)
            
            // Convert color to RGBA with alpha if erased
            let displayColor = item.color
            if (isErased) {
              // Parse hex color and add alpha
              if (item.color.startsWith('#')) {
                displayColor = item.color + '4D' // ~50% opacity in hex (77 = ~0.3 alpha, 4D = ~0.3)
              } else {
                displayColor = 'rgba(150,150,150,0.3)'
              }
            }
            
            // If it has svgPath, recreate the Skia path from SVG
            if (item.svgPath) {
              try {
                const recreatedPath = item.path || Skia.Path.MakeFromSVGString(item.svgPath)
                if (recreatedPath) {
                  return (
                    <Path
                      key={`path-${index}`}
                      path={recreatedPath}
                      color={displayColor}
                      style="stroke"
                      strokeWidth={item.strokeWidth}
                      strokeCap="round"
                      strokeJoin="round"
                    />
                  )
                }
              } catch (e) {
                // If SVG path fails, skip this one
                return null
              }
            }
            // If it's a live Skia path object
            if (item.path && typeof item.path === "object" && item.path.moveTo) {
              return (
                <Path
                  key={`path-${index}`}
                  path={item.path}
                  color={displayColor}
                  style="stroke"
                  strokeWidth={item.strokeWidth}
                  strokeCap="round"
                  strokeJoin="round"
                />
              )
            }
            return null
          })}
          {/* Live stroke while drawing */}
            {livePath?.path && (
            <Path
              path={livePath.path}
              color={livePath.color}
              style="stroke"
              strokeWidth={livePath.strokeWidth}
              strokeCap="round"
              strokeJoin="round"
            />
          )}
          {/* Eraser cursor indicator */}
          {eraserMode && eraserPoint && (() => {
            const p = Skia.Path.Make()
            p.addCircle(eraserPoint.x, eraserPoint.y, 10)
            return (
              <Path
                path={p}
                color="rgba(255,0,0,0.25)"
                style="stroke"
                strokeWidth={2}
              />
            )
          })()}
        </Canvas>
      </GestureDetector>

      {/* Drawing Tools - only show when in drawing mode */}
      {isDrawingMode && showTools && (
        <View style={styles.toolsContainer}>
          {/* Color Picker */}
          <View style={styles.colorRow}>
            {colors.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorButton,
                  { backgroundColor: c },
                  color === c && styles.selectedColor,
                  c === "#FFFFFF" && styles.whiteColorBorder,
                ]}
              />
            ))}
          </View>

          {/* Stroke Width */}
          <View style={styles.strokeRow}>
            {strokeWidths.map((width) => (
              <TouchableOpacity
                key={width}
                onPress={() => setStrokeWidth(width)}
                style={[
                  styles.strokeButton,
                  strokeWidth === width && styles.selectedStroke,
                ]}>
                <Text style={styles.strokeText}>{width}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleUndo} style={styles.actionButton}>
              <AntDesign name="back" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={styles.actionButton}>
              <AntDesign name="delete" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setEraserMode((prev) => !prev)}
              style={[styles.actionButton, eraserMode && styles.activeButton]}>
              <AntDesign name="tool" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.actionButton, styles.saveButton]}>
              <AntDesign name="check" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.actionButton}>
              <AntDesign name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Toggle Tools Button */}
      {isDrawingMode && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowTools(!showTools)}>
          <AntDesign name={showTools ? "up" : "down"} size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  canvas: {
    flex: 1,
  },
  toolsContainer: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 15,
    padding: 12,
    gap: 10,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  colorButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: "#666",
  },
  whiteColorBorder: {
    borderColor: "#999",
  },
  selectedColor: {
    borderColor: "#fff",
    borderWidth: 3,
  },
  strokeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  strokeButton: {
    width: 40,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#555",
  },
  selectedStroke: {
    backgroundColor: "#007AFF",
  },
  strokeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 8,
    minWidth: 45,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  activeButton: {
    backgroundColor: "#007AFF",
  },
  toggleButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
    borderRadius: 20,
  },
})

export default DrawingOverlay
