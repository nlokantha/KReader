import { Button, StyleSheet, Text, View } from "react-native"
import React, { forwardRef, useCallback, useEffect, useState } from "react"
import {
  Toc,
  Section as SectionType,
  useReader,
} from "@epubjs-react-native/core"

import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet"
import Section from "./Section"

const TableOfContents = forwardRef((props, ref) => {
  const { toc, section, theme } = useReader()
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState(toc)

  const snapPoints = React.useMemo(() => ["50%", "90%"], [])

  const renderItem = useCallback(
    ({ item }) => (
      <Section
        searchTerm={searchTerm}
        isCurrentSection={section?.id === item?.id}
        section={item}
        onPress={(_section) => {
          props.onPressSection(_section)
        }}
      />
    ),
    [props.onPressSection, searchTerm, section?.id]
  )

  useEffect(() => {
    setData(toc)
  }, [toc])

  const header = useCallback(
    () => (
      <View style={{ backgroundColor: theme.body.background }}>
        <View style={styles.title}>
          <Text variant="titleMedium" style={{ color: "black" }}>
            Table of Contents
          </Text>
          {/* 
          <Button mode="text" textColor={"black"} onPress={props.onClose}>
            Close
          </Button> */}
        </View>

        <View style={{ width: "100%" }}>
          <BottomSheetTextInput
            inputMode="search"
            returnKeyType="search"
            returnKeyLabel="Search"
            autoCorrect={false}
            autoCapitalize="none"
            defaultValue={searchTerm}
            style={styles.input}
            placeholder="Type an term here..."
            placeholderTextColor={"grey"}
            onSubmitEditing={(event) => {
              event.persist()

              setSearchTerm(event.nativeEvent?.text)
              setData(
                toc.filter((elem) =>
                  new RegExp(event.nativeEvent?.text, "gi").test(elem?.label)
                )
              )
            }}
          />
        </View>
      </View>
    ),
    [props.onClose, searchTerm, theme.body.background, toc]
  )
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        style={{
          ...styles.container,
          backgroundColor: theme.body.background,
        }}
        handleStyle={{ backgroundColor: theme.body.background }}
        backgroundStyle={{ backgroundColor: theme.body.background }}
        onDismiss={() => setSearchTerm("")}>
        <BottomSheetFlatList
          data={data}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={header}
          style={{ width: "100%" }}
          maxToRenderPerBatch={20}
        />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
})

export default TableOfContents

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    width: "100%",
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: "rgba(151, 151, 151, 0.25)",
  },
})
