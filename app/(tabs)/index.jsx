import { StyleSheet, Text, TextInput, View } from "react-native"
import React from "react"
import ScreenWrapper from "@/components/ScreenWrapper"

import { hp, wp } from "../../helpers/commen"
import SearchBar from "@/components/SearchBar"

const Home = () => {
  return (
    <ScreenWrapper bg={"white"}>
      <View style={styles.container}>
        {/* searchBar */}
        <SearchBar />

        {/* welcome note */}
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.title}>Welcome to KReader!</Text>
            <Text>
              Find Your next great read by browsing top picks and recommendation
              below,or shop the store
            </Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "lightgrey",
    width: wp(80),
    height: hp(15),
  },
  title: {
    fontWeight: "600",
    fontSize: 18,
  },
})
