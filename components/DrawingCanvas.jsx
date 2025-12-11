import React, { useState } from "react"
import { View, StyleSheet, TouchableOpacity, Text } from "react-native"
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
} from "@shopify/react-native-skia"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useSharedValue, runOnJS } from "react-native-reanimated"

const DrawingCanvas = ({ onSave, onClose, width, height }) => {
  const [paths, setPaths] = useState([])
  const [color, setColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(3)

  const canvasRef = useCanvasRef()
  const currentPath = useSharedValue(null)

  const handleStartDrawing = (x, y, currentColor, currentStrokeWidth) => {
    'worklet'
    const newPath = Skia.Path.Make()
    newPath.moveTo(x, y)
    currentPath.value = {
      path: newPath,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
    }
  }

  const handleUpdateDrawing = (x, y) => {
    'worklet'
    if (currentPath.value) {
      currentPath.value.path.lineTo(x, y)
    }
  }

  const handleEndDrawing = (pathData) => {
    setPaths((prevPaths) => [...prevPaths, pathData])
  }

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      handleStartDrawing(event.x, event.y, color, strokeWidth)
    })
    .onUpdate((event) => {
      handleUpdateDrawing(event.x, event.y)
    })
    .onEnd(() => {
      if (currentPath.value) {
        runOnJS(handleEndDrawing)(currentPath.value)
        currentPath.value = null
      }
    })

  const handleClear = () => {
    setPaths([])
    currentPath.value = null
  }

  const handleUndo = () => {
    setPaths((prevPaths) => prevPaths.slice(0, -1))
  }

  const handleSave = async () => {
    if (canvasRef.current) {
      const image = canvasRef.current.makeImageSnapshot()
      if (image) {
        const base64 = image.encodeToBase64()
        onSave(base64, paths)
      }
    }
  }

  const colors = ["#000000", "#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF"]
  const strokeWidths = [2, 3, 5, 8]

  return (
    <View style={styles.container}>
      {/* Drawing Canvas */}
      <View style={styles.canvasContainer}>
        <GestureDetector gesture={panGesture}>
          <Canvas
            ref={canvasRef}
            style={{ width: width || 350, height: height || 500 }}>
            {paths.map((item, index) => (
              <Path
                key={index}
                path={item.path}
                color={item.color}
                style="stroke"
                strokeWidth={item.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}
          </Canvas>
        </GestureDetector>
      </View>

      {/* Color Picker */}
      <View style={styles.colorPicker}>
        <Text style={styles.label}>Color:</Text>
        {colors.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setColor(c)}
            style={[
              styles.colorButton,
              { backgroundColor: c },
              color === c && styles.selectedColor,
            ]}
          />
        ))}
      </View>

      {/* Stroke Width Picker */}
      <View style={styles.strokePicker}>
        <Text style={styles.label}>Size:</Text>
        {strokeWidths.map((width) => (
          <TouchableOpacity
            key={width}
            onPress={() => setStrokeWidth(width)}
            style={[
              styles.strokeButton,
              strokeWidth === width && styles.selectedStroke,
            ]}>
            <Text style={styles.strokeText}>{width}px</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleUndo} style={styles.button}>
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} style={styles.button}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.button, styles.saveButton]}>
          <Text style={[styles.buttonText, { color: "white" }]}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.button}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  canvasContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  colorPicker: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  colorButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  selectedColor: {
    borderColor: "#000",
    borderWidth: 3,
  },
  strokePicker: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  strokeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  selectedStroke: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  strokeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
})

export default DrawingCanvas
