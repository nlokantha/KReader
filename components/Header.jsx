import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React from "react"
import { AntDesign } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import {
  ReaderProvider,
  Reader,
  useReader,
  Themes,
  Annotation,
} from "@epubjs-react-native/core"
import { themes } from "./utils"

const Header = () => {
  const {
    theme,
    annotations,
    changeFontSize,
    changeFontFamily,
    changeTheme,
    goToLocation,
    addAnnotation,
    removeAnnotation,
  } = useReader()
  const router = useRouter()

  const switchTheme = () => {
    const index = Object.values(themes).indexOf(theme)
    const nextTheme =
      Object.values(themes)[(index + 1) % Object.values(themes).length]

    changeTheme(nextTheme)
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.buttonContainer}>
        <AntDesign name="left" size={24} color="black" />
      </TouchableOpacity>
      <View style={{ gap: 10, flexDirection: "row" }}>
        <TouchableOpacity style={styles.buttonContainer}>
          <AntDesign name="bars" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer}>
          <AntDesign name="bars" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer}>
          <AntDesign name="bars" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={switchTheme} style={styles.buttonContainer}>
          <AntDesign name="setting" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonContainer: {
    backgroundColor: "lightgrey",
    padding: 5,
    borderRadius: 10,
    borderCurve: "continuous",
  },
})
