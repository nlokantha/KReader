import { StyleSheet, Text, TextInput, View } from "react-native"
import React from "react"
import { Feather } from "@expo/vector-icons"
import { hp, wp } from "@/helpers/commen"

const SearchBar = () => {
  return (
    <View style={styles.searchBarContainer}>
      <Feather name="search" size={24} color="black" />
      <TextInput placeholder="Search Book" />
    </View>
  )
}

export default SearchBar

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(4),
    backgroundColor: "lightgrey",
    borderRadius: 10,
    paddingHorizontal: wp(2),
    gap: 10,
    paddingVertical: hp(0.2),
  },
})
