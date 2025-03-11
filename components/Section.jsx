import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React from "react"
import { useReader } from "@epubjs-react-native/core"
import { Feather } from "@expo/vector-icons"

const Section = ({ searchTerm, isCurrentSection, section, onPress }) => {
  const { theme } = useReader()
  const regex = new RegExp(`(${searchTerm})`, "gi")
  const parts = section?.label.split(regex)
  return (
    <TouchableOpacity
      key={section.id}
      style={styles.container}
      onPress={() => onPress(section)}>
      <View style={styles.icon}>
        <Feather name="bookmark" size={24} color="black" />

        {/* <Text style={styles.bookmarkLocationNumber} variant="labelSmall">
          {location}
        </Text> */}
      </View>

      <View style={styles.info}>
        {!searchTerm && (
          <Text
            style={{
              ...styles.name,
              color: "black",
            }}>
            {section?.label}
          </Text>
        )}

        {searchTerm && (
          <Text
            style={{
              ...styles.name,
              color: "black",
            }}>
            {parts.filter(String).map((part, index) => {
              return regex.test(part) ? (
                <Text style={styles.highlight} key={`${index}-part-highlight`}>
                  {part}
                </Text>
              ) : (
                <Text key={`${index}-part`}>{part}</Text>
              )
            })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default Section

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    width: "85%",
  },
  chapter: { marginBottom: 2 },
  name: { fontStyle: "italic" },
  highlight: { backgroundColor: "yellow" },
})
