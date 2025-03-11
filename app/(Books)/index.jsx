import { StyleSheet, View, Text, Button } from "react-native"
import React, { useCallback, useRef, useState } from "react"
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
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet"
import SearchList from "@/components/SearchList"
import TableOfContents from "@/components/TableOfContents"

const BookContent = () => {
  const { uri } = useLocalSearchParams()
  const [fontSize, setFontSize] = useState(16) // Default font size
  const { theme, changeFontSize, annotations, goToLocation } = useReader()

  const bottomSheetModalRef = useRef(null)
  const searchListRef = useRef(null)
  const tableOfContentRef = useRef(null)

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index)
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <Header
        handlePresentModalPress={handlePresentModalPress}
        onPressSearch={() => searchListRef.current?.present()}
        onOpenTocList={() => tableOfContentRef.current?.present()}
      />
      <Reader
        src={uri}
        fileSystem={useFileSystem}
        flow="scrolled-doc"
        spread="auto"
        me
      />
      {/* controls */}

      <BottomSheetModal ref={bottomSheetModalRef} onChange={handleSheetChanges}>
        <BottomSheetView style={styles.contentContainer}>
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
        </BottomSheetView>
      </BottomSheetModal>
      <SearchList
        ref={searchListRef}
        onClose={() => searchListRef.current?.dismiss()}
      />
      <TableOfContents
        ref={tableOfContentRef}
        onPressSection={(section) => {
          goToLocation(section.href.split("/")[1])
          tableOfContentRef.current?.dismiss()
        }}
        onClose={() => tableOfContentRef.current?.dismiss()}
      />
    </View>
  )
}

const Book = () => {
  return (
    <ScreenWrapper bg={"white"} style={{ flex: 1 }}>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <ReaderProvider>
            <BookContent />
          </ReaderProvider>
        </BottomSheetModalProvider>
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
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
})
