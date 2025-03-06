import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { hp, wp } from "@/helpers/commen"

const Header = () => {
  return (
    <View style={styles.container}>
      <Text>Header</Text>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: hp(10),
    backgroundColor: "red",
  },
})
