import { StyleSheet, View, Text } from "react-native"
import React, { useState } from "react"
import { useLocalSearchParams } from "expo-router"
import {
  Reader,
  ReaderProvider,
  Themes,
  useReader,
} from "@epubjs-react-native/core"
import { useFileSystem } from "@epubjs-react-native/expo-file-system"
import ScreenWrapper from "@/components/ScreenWrapper"
import Slider from "@react-native-community/slider"
import Header from "@/components/Header"

const BookContent = () => {
  const { uri } = useLocalSearchParams()
  const [fontSize, setFontSize] = useState(16) // Default font size
  const { theme, changeFontSize } = useReader()

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Reader
        src={uri}
        fileSystem={useFileSystem}
        flow="scrolled-doc"
        spread="auto"
      />
      <View style={styles.controls}>
        <Text>Font Size: {fontSize}px</Text>
        <Slider
          style={{ width: "80%" }}
          minimumValue={12}
          maximumValue={32}
          step={2}
          value={fontSize}
          onValueChange={(value) => {
            setFontSize(value)
            changeFontSize(`${value}px`)
          }}
        />
      </View>
    </View>
  )
}

const Book = () => {
  return (
    <ScreenWrapper bg={"white"} style={{ flex: 1 }}>
      <ReaderProvider>
        <BookContent />
      </ReaderProvider>
    </ScreenWrapper>
  )
}

export default Book

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    padding: 20,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
})
