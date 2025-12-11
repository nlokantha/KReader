import React, { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { Canvas, Path, Skia } from "@shopify/react-native-skia"

const PersistentDrawings = ({ notes, currentLocation, width, height, show = true }) => {
  const [displayPaths, setDisplayPaths] = useState([])

  // Find drawings for current page and recreate them from SVG
  useEffect(() => {
    if (currentLocation?.start?.cfi && notes && notes.length > 0) {
      const currentPageNote = notes.find(
        (n) => n.location?.start?.cfi === currentLocation.start.cfi
      )

      if (currentPageNote && currentPageNote.paths && Array.isArray(currentPageNote.paths)) {
        // Recreate paths from stored SVG data
        const recreatedPaths = currentPageNote.paths
          .filter((p) => p && p.svgPath && p.color && p.strokeWidth)
          .map((pathMeta) => {
            try {
              const recreatedPath = Skia.Path.MakeFromSVGString(pathMeta.svgPath)
              if (recreatedPath) {
                return {
                  path: recreatedPath,
                  color: pathMeta.color,
                  strokeWidth: pathMeta.strokeWidth,
                }
              }
              return null
            } catch (e) {
              console.warn("Failed to recreate path from SVG:", e)
              return null
            }
          })
          .filter(Boolean)
        
        setDisplayPaths(recreatedPaths)
      } else {
        setDisplayPaths([])
      }
    } else {
      setDisplayPaths([])
    }
  }, [currentLocation?.start?.cfi, notes])

  if (!show || displayPaths.length === 0) {
    return null
  }

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <Canvas style={styles.canvas}>
        {displayPaths.map((item, index) => (
          <Path
            key={`persistent-${index}`}
            path={item.path}
            color={item.color}
            style="stroke"
            strokeWidth={item.strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        ))}
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  canvas: {
    flex: 1,
  },
})

export default PersistentDrawings
