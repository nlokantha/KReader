import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useState } from "react"
import { AntDesign, FontAwesome } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import {
  ReaderProvider,
  Reader,
  useReader,
  Themes,
  Annotation,
} from "@epubjs-react-native/core"
import { themes } from "./utils"
import { wp } from "@/helpers/commen"

const Header = ({ handlePresentModalPress, onPressSearch, onOpenTocList }) => {
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
  const [showSettings, setShowSettings] = useState(false)
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
        <TouchableOpacity
          onPress={onOpenTocList}
          style={styles.buttonContainer}>
          <AntDesign name="bars" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePresentModalPress}
          style={styles.buttonContainer}>
          <FontAwesome name="font" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressSearch}
          style={styles.buttonContainer}>
          <AntDesign name="search1" size={24} color="black" />
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
    paddingHorizontal: wp(4),
  },
  buttonContainer: {
    backgroundColor: "lightgrey",
    padding: 5,
    borderRadius: 10,
    borderCurve: "continuous",
  },
})
