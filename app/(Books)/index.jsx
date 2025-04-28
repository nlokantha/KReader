import {
  StyleSheet,
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
} from "react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"
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
import { hp, wp } from "@/helpers/commen"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet"
import SearchList from "@/components/SearchList"
import TableOfContents from "@/components/TableOfContents"
import Location from "@/components/Location"

const BookContent = () => {
  const { uri } = useLocalSearchParams()
  const [fontSize, setFontSize] = useState(24) // Default font size
  const [page, setPage] = useState(0)
  const {
    theme,
    changeFontSize,
    annotations,
    goToLocation,
    getLocations,
    currentLocation,
    totalLocations,
    injectJavascript,
  } = useReader()

  const bottomSheetModalRef = useRef(null)
  const searchListRef = useRef(null)
  const tableOfContentRef = useRef(null)

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index)
  }, [])

  const goToPage = () => {
    const pageNum = parseInt(page, 10)
    if (!isNaN(pageNum)) {
      injectJavascript(`
        try {
          const cfi = book.locations.cfiFromPercentage(${pageNum} / ${totalLocations});
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "onCfiFromPercentage", cfi })); true
        } catch (error) {
          alert(error?.message);
        }
      `)
    }
  }

  // useEffect(() => {
  //   setPage(currentLocation?.start?.location)
  // }, [currentLocation?.start?.location])

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
        flow="paginated"
        spread="none"
        onWebViewMessage={(message) => {
          if (message.type === "onCfiFromPercentage") {
            goToLocation(message.cfi)
          }
        }}
      />

      <Location />
      {/* controls */}

      <BottomSheetModal ref={bottomSheetModalRef} onChange={handleSheetChanges}>
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.controls}>
            <Text>Font Size: {fontSize || 24}px</Text>
            <Slider
              style={{ width: "80%" }}
              minimumValue={12}
              maximumValue={32}
              step={2}
              value={fontSize || 24}
              onValueChange={(value) => {
                setFontSize(value)
                changeFontSize(`${value}px`)
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
              }}>
              <TextInput
                placeholder="Page Number"
                onChangeText={(value) => setPage(value)}
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  width: wp(50),
                  height: hp(3),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              />
              <TouchableOpacity
                onPress={goToPage}
                style={{
                  borderRadius: 5,
                  backgroundColor: "black",
                  padding: 10,
                }}>
                <Text style={{ color: "white" }}>GO</Text>
              </TouchableOpacity>
            </View>
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
    flex: 1,
    gap: 10,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
})
