import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useEffect, useState } from "react"
import ScreenWrapper from "@/components/ScreenWrapper"
import SearchBar from "@/components/SearchBar"
import { wp } from "@/helpers/commen"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"
import { useRouter } from "expo-router"

const Library = () => {
  const [fileUri, setFileUri] = useState(null)
  const router = useRouter()

  const pickEpubFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/epub+zip",
        copyToCacheDirectory: false,
      })

      console.log(res)

      if (res.type !== "cancel") {
        const uri = res.assets[0].uri

        const newUri = `${FileSystem.documentDirectory}${res.assets[0].name}`
        await FileSystem.copyAsync({ from: uri, to: newUri })

        setFileUri(newUri)
        router.push({
          pathname: "/(Books)",
          params: {
            uri: newUri,
          },
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* searchBar */}
        <SearchBar />

        {/* brows button */}
        <TouchableOpacity
          onPress={pickEpubFile}
          style={{
            alignItems: "center",
            marginVertical: 10,
            padding: 10,
            backgroundColor: "lightgrey",
            marginHorizontal: wp(10),
            borderRadius: 10,
          }}>
          <Text>Get Book</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  )
}

export default Library

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
