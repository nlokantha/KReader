import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { Tabs } from "expo-router"
import { AntDesign, Ionicons, Octicons } from "@expo/vector-icons"
import { ReaderProvider } from "@epubjs-react-native/core"

const _layout = () => {
  return (
    <ReaderProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Home",
            tabBarLableStyle: { color: "black" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <AntDesign name="home" size={24} color="black" />
              ) : (
                <AntDesign name="home" size={24} color="black" />
              ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            tabBarLabel: "Library",
            tabBarLableStyle: { color: "black" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="library-outline" size={24} color="black" />
              ) : (
                <Ionicons name="library-outline" size={24} color="black" />
              ),
          }}
        />
        <Tabs.Screen
          name="store"
          options={{
            tabBarLabel: "Store",
            tabBarLableStyle: { color: "black" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="cart-outline" size={24} color="black" />
              ) : (
                <Ionicons name="cart-outline" size={24} color="black" />
              ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            tabBarLabel: "More",
            tabBarLableStyle: { color: "black" },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Octicons name="three-bars" size={24} color="black" />
              ) : (
                <Octicons name="three-bars" size={24} color="black" />
              ),
          }}
        />
      </Tabs>
    </ReaderProvider>
  )
}

export default _layout

const styles = StyleSheet.create({})
