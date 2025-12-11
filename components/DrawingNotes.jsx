import React, { forwardRef, useState } from "react"
import { View, StyleSheet, Text, Dimensions } from "react-native"
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import DrawingCanvas from "./DrawingCanvas"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const DrawingNotes = forwardRef(({ onSaveNote, currentLocation }, ref) => {
  const handleSave = (imageBase64, paths) => {
    // Save the drawing with current location in EPUB
    const note = {
      id: Date.now().toString(),
      imageBase64,
      paths,
      location: currentLocation,
      createdAt: new Date().toISOString(),
    }
    
    console.log("Saving note:", note)
    onSaveNote(note)
    ref.current?.dismiss()
  }

  const handleClose = () => {
    console.log("Closing drawing modal")
    ref.current?.dismiss()
  }

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={["90%"]}
      enablePanDownToClose={true}
      enableDismissOnClose={true}
      onDismiss={() => console.log("Drawing modal dismissed")}>
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Draw Your Note</Text>
          <Text style={styles.subtitle}>
            Draw or write your thoughts about this page
          </Text>
        </View>
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
          <DrawingCanvas
            onSave={handleSave}
            onClose={handleClose}
            width={SCREEN_WIDTH - 40}
            height={SCREEN_HEIGHT * 0.6}
          />
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  scrollContent: {
    flexGrow: 1,
  },
})

export default DrawingNotes
