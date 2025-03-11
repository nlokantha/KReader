import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React from "react"
import {
  SearchResult as SearchResultType,
  useReader,
} from "@epubjs-react-native/core"
import { Feather } from "@expo/vector-icons"

const SearchResult = ({ searchTerm, searchResult, onPress }) => {
  const regex = new RegExp(`(${searchTerm})`, "gi")
  const parts = searchResult.excerpt.split(regex)
  return (
    <TouchableOpacity
      key={searchResult.cfi}
      style={styles.container}
      onPress={() => onPress(searchResult)}>
      <View style={styles.icon}>
        <Feather name="bookmark" size={24} color="black" />
        {/* <Text style={styles.bookmarkLocationNumber} variant="labelSmall">
          {location}
        </Text> */}
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={{ ...styles.chapter, color: "black" }}>
          Chapter: {searchResult.section?.label}
        </Text>

        <View>
          <Text
            style={{
              ...styles.excerpt,
              color: "black",
            }}
            onPress={() => {
              onPress(searchResult)
            }}>
            &quot;
            {parts.filter(String).map((part, index) => {
              return regex.test(part) ? (
                <Text style={styles.highlight} key={`${index}-part-highlight`}>
                  {part}
                </Text>
              ) : (
                <Text key={`${index}-part`} style={{ color: "black" }}>
                  {part}
                </Text>
              )
            })}
            &quot;
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default SearchResult

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    width: "85%",
  },
  chapter: { marginBottom: 2 },
  excerpt: { fontStyle: "italic" },
  highlight: { backgroundColor: "yellow" },
})
