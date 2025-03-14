import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { wp } from "@/helpers/commen"
import { useReader } from "@epubjs-react-native/core"

const Location = () => {
  const { goToLocation, currentLocation, totalLocations } = useReader()
  //   console.log(currentLocation)

  const getCFI = (pageNumber) => {
    if (currentLocation?.start?.location == pageNumber) {
      const cfi = currentLocation?.start?.cfi
      return cfi
    }
  }

  return (
    <View style={styles.container}>
      <Text>{currentLocation?.start?.location}</Text>
      <Text>/</Text>
      <Text>{totalLocations}</Text>
    </View>
  )
}

export default Location

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: wp(4),
  },
})
