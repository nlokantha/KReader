import React, { forwardRef } from "react"
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native"
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import { AntDesign } from "@expo/vector-icons"

const SavedNotes = forwardRef(({ notes, onDeleteNote, onGoToNote }, ref) => {
  const handleDelete = (noteId) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteNote(noteId),
        },
      ]
    )
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["70%", "90%"]}
      enablePanDownToClose={true}>
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Notes ({notes.length})</Text>
        </View>
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
          {notes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AntDesign name="edit" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No notes yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the edit icon to create your first drawing note
              </Text>
            </View>
          ) : (
            notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <TouchableOpacity
                  onPress={() => onGoToNote(note)}
                  style={styles.noteContent}>
                  <View style={styles.noteImageContainer}>
                    <View style={styles.colorPreview}>
                      {note.paths?.slice(0, 3).map((pathMeta, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.colorDot,
                            {
                              backgroundColor: pathMeta.color || "#000",
                              width: pathMeta.strokeWidth * 2 || 3,
                              height: pathMeta.strokeWidth * 2 || 3,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.noteInfo}>
                    <Text style={styles.noteDate}>
                      {new Date(note.createdAt).toLocaleDateString()} at{" "}
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </Text>
                    {note.location?.start?.location && (
                      <Text style={styles.noteLocation}>
                        Page {note.location.start.location}
                      </Text>
                    )}
                    <Text style={styles.pathsCount}>
                      {note.paths?.length || 0} strokes
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(note.id)}
                  style={styles.deleteButton}>
                  <AntDesign name="delete" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  noteCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  noteContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  noteImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  colorPreview: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  colorDot: {
    borderRadius: 2,
  },
  noteInfo: {
    flex: 1,
    justifyContent: "center",
  },
  pathsCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  noteDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  noteLocation: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  deleteButton: {
    padding: 8,
  },
})

export default SavedNotes
