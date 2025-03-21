import { StyleSheet, Text, View } from "react-native"
import React, {
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react"
import { useReader } from "@epubjs-react-native/core"
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet"
import SearchResult from "./SearchResult"

const SearchList = forwardRef((props, ref) => {
  const {
    searchResults,
    goToLocation,
    search,
    isSearching,
    addAnnotation,
    removeAnnotationByCfi,
    clearSearchResults,
    theme,
  } = useReader()

  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState(searchResults.results)
  const [page, setPage] = useState(1)

  const snapPoints = useMemo(() => ["50%", "90%"], [])
  const handleClose = useCallback(() => {
    clearSearchResults()
    setPage(1)
    setData([])
  }, [clearSearchResults])

  const renderItem = ({ item }) => (
    <SearchResult
      searchTerm={searchTerm}
      searchResult={item}
      onPress={(searchResult) => {
        goToLocation(searchResult.cfi)
        addAnnotation("highlight", searchResult.cfi)
        setTimeout(() => {
          removeAnnotationByCfi(searchResult.cfi)
        }, 3000)
        clearSearchResults()
        setPage(1)
        setData([])
        props.onClose()
      }}
    />
  )

  const fetchMoreData = useCallback(() => {
    if (searchResults.results.length > 0 && !isSearching) {
      search(searchTerm, page + 1, 20)
      setPage(page + 1)
    }
  }, [isSearching, page, search, searchResults.results.length, searchTerm])

  const empty = () => (
    <View>
      <Text>No Results</Text>
    </View>
  )
  useEffect(() => {
    if (searchResults.results.length > 0) {
      setData((oldState) => [...oldState, ...searchResults.results])
    }
  }, [searchResults])

  const footer = () => <View style={{ height: 20 }} /> // Dummy footer

  const header = useCallback(
    () => (
      <View>
        <View style={styles.title}>
          <Text style={{ color: "black" }}>Search Results</Text>
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
            placeholder="Type a term here..."
            placeholderTextColor={"grey"}
            onSubmitEditing={(event) => {
              setSearchTerm(event.nativeEvent.text)
              setData([])
              setPage(1)
              search(event.nativeEvent.text, 1, 20)
            }}
          />
        </View>

        {isSearching && (
          <View style={styles.title}>
            <Text
              style={{
                fontStyle: "italic",
                color: "black",
              }}>
              Searching results...
            </Text>
          </View>
        )}
      </View>
    ),
    [isSearching, search, searchTerm, clearSearchResults] // Removed `clearSearchResults`
  )

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        style={styles.container}
        backgroundStyle={{ backgroundColor: "lightgrey" }}
        onDismiss={handleClose}>
        <BottomSheetFlatList
          data={data}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => item.cfi.concat(index.toString())}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          ListEmptyComponent={empty}
          style={{ width: "100%" }}
          maxToRenderPerBatch={20}
          onEndReachedThreshold={0.2}
          onEndReached={fetchMoreData}
        />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
})

export default SearchList

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
    marginVertical: 10,
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
