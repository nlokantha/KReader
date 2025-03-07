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
import { wp } from "@/helpers/commen"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { BottomSheetModal } from "@gorhom/bottom-sheet"

const BookContent = () => {
  const { uri } = useLocalSearchParams()
  const [fontSize, setFontSize] = useState(16) // Default font size
  const { theme, changeFontSize, annotations } = useReader()

  const bookmarksListRef = React.useRef < BottomSheetModal > null
  const searchListRef = React.useRef < BottomSheetModal > null
  const tableOfContentsRef = React.useRef < BottomSheetModal > null
  const annotationsListRef = React.useRef < BottomSheetModal > null

  // const [tempMark, setTempMark] = (React.useState < Annotation) | (null > null)
  // const [selection, setSelection] =
  //   (React.useState <
  //     {
  //       cfiRange,
  //       text,
  //     }) |
  //   (null > null)
  // const [selectedAnnotation, setSelectedAnnotation] =
  //   (React.useState < Annotation) | (undefined > undefined)

  const open = () => {}

  return (
    <View style={{ flex: 1, paddingHorizontal: wp(4) }}>
      <Header />
      <Reader
        src={uri}
        fileSystem={useFileSystem}
        flow="scrolled-doc"
        spread="auto"
        me
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
      <GestureHandlerRootView>
        <ReaderProvider>
          <BookContent />
        </ReaderProvider>
      </GestureHandlerRootView>
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
