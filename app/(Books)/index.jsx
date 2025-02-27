import { Image, StyleSheet, Text, View } from "react-native"
import React, { useEffect, useState } from "react"
import { useLocalSearchParams } from "expo-router"
import { Reader, useReader } from "@epubjs-react-native/core"
import { useFileSystem } from "@epubjs-react-native/expo-file-system"
import WebView from "react-native-webview"

const Book = () => {
  const { uri } = useLocalSearchParams()
  console.log(uri)
  const { goToLocation } = useReader()

  return (
    <View style={{ flex: 1 }}>
      {/* <Reader src={uri} fileSystem={useFileSystem} /> */}
      <WebView source={{ uri }} />
    </View>
  )
}

export default Book

const styles = StyleSheet.create({})
