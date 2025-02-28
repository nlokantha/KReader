import { StyleSheet, View } from "react-native"
import React from "react"
import { useLocalSearchParams } from "expo-router"
import { Reader, ReaderProvider } from "@epubjs-react-native/core"
import { useFileSystem } from "@epubjs-react-native/expo-file-system"
import ScreenWrapper from "@/components/ScreenWrapper"

const Book = () => {
  const { uri } = useLocalSearchParams()

  return (
    <ScreenWrapper bg={"white"} style={{ flex: 1 }}>
      <ReaderProvider>
        <Reader src={uri} fileSystem={useFileSystem} />
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
})
