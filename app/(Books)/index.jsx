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
import DrawingOverlay from "@/components/DrawingOverlay"
import SavedNotes from "@/components/SavedNotes"
import PersistentDrawings from "@/components/PersistentDrawings"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Dimensions } from "react-native"
import { Skia } from "@shopify/react-native-skia"

const BookContent = () => {
  const { uri } = useLocalSearchParams()
  const [fontSize, setFontSize] = useState(24) // Default font size
  const [page, setPage] = useState(0)
  const [notes, setNotes] = useState([])
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [currentPageDrawings, setCurrentPageDrawings] = useState([])
  const [showDrawings, setShowDrawings] = useState(true)
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
  const savedNotesRef = useRef(null)

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

  // Load saved notes when component mounts
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem(`notes_${uri}`)
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes))
        }
      } catch (error) {
        console.error("Error loading notes:", error)
      }
    }
    loadNotes()
  }, [uri])

  // Load drawings for current page
  useEffect(() => {
    if (currentLocation?.start?.cfi) {
      const pageNote = notes.find(
        (n) => n.location?.start?.cfi === currentLocation.start.cfi
      )
      setCurrentPageDrawings(pageNote?.paths || [])
    }
  }, [currentLocation?.start?.cfi, notes])

  // useEffect(() => {
  //   setPage(currentLocation?.start?.location)
  // }, [currentLocation?.start?.location])

  return (
    <View style={{ flex: 1 }}>
      <Header
        handlePresentModalPress={handlePresentModalPress}
        onPressSearch={() => searchListRef.current?.present()}
        onOpenTocList={() => tableOfContentRef.current?.present()}
        onOpenDrawing={() => {
          setIsDrawingMode(true)
          // Load existing drawings for current page
          const pageDrawings = notes.find(
            (n) => n.location?.start?.cfi === currentLocation?.start?.cfi
          )
          setCurrentPageDrawings(pageDrawings?.paths || [])
        }}
        onOpenSavedNotes={() => savedNotesRef.current?.present()}
        isDrawingMode={isDrawingMode}
        showDrawings={showDrawings}
        onToggleDrawings={() => setShowDrawings((prev) => !prev)}
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
      
      {/* Display persistent drawings on current page */}
      <PersistentDrawings
        notes={notes}
        currentLocation={currentLocation}
        width={Dimensions.get("window").width}
        height={Dimensions.get("window").height}
        show={showDrawings}
      />
      
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
      
      {/* Drawing Overlay - appears on top of the book */}
      <DrawingOverlay
        isDrawingMode={isDrawingMode}
        existingPaths={currentPageDrawings}
        width={Dimensions.get("window").width}
        height={Dimensions.get("window").height}
        onSaveDrawing={async (newPaths) => {
          // newPaths already has svgPath from DrawingOverlay
          
          // Check if this page already has drawings
          const existingNoteIndex = notes.findIndex(
            (n) => n.location?.start?.cfi === currentLocation?.start?.cfi
          )
          
          let updatedNotes
          if (existingNoteIndex >= 0) {
            // Replace existing note with edited paths
            const updatedNote = {
              ...notes[existingNoteIndex],
              paths: newPaths,
              updatedAt: new Date().toISOString(),
            }
            updatedNotes = [
              ...notes.slice(0, existingNoteIndex),
              updatedNote,
              ...notes.slice(existingNoteIndex + 1),
            ]
          } else {
            // Create new note
            const newNote = {
              id: Date.now().toString(),
              paths: newPaths,
              location: currentLocation,
              createdAt: new Date().toISOString(),
            }
            updatedNotes = [...notes, newNote]
          }
          
          setNotes(updatedNotes)
          setCurrentPageDrawings(
            updatedNotes.find(
              (n) => n.location?.start?.cfi === currentLocation?.start?.cfi
            )?.paths || []
          )
          try {
            await AsyncStorage.setItem(
              `notes_${uri}`,
              JSON.stringify(updatedNotes)
            )
          } catch (error) {
            console.error("Error saving note:", error)
          }
          setIsDrawingMode(false)
        }}
        onClose={() => setIsDrawingMode(false)}
      />
      
      <SavedNotes
        ref={savedNotesRef}
        notes={notes}
        onDeleteNote={async (noteId) => {
          const updatedNotes = notes.filter((n) => n.id !== noteId)
          setNotes(updatedNotes)
          try {
            await AsyncStorage.setItem(
              `notes_${uri}`,
              JSON.stringify(updatedNotes)
            )
          } catch (error) {
            console.error("Error deleting note:", error)
          }
        }}
        onGoToNote={(note) => {
          if (note.location?.start?.cfi) {
            goToLocation(note.location.start.cfi)
            savedNotesRef.current?.dismiss()
          }
        }}
      />
    </View>
  )
}

const Book = () => {
  return (
    <ScreenWrapper bg={"white"} style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
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
