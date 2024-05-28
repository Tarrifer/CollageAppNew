import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  onSnapshot,
  collection,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

const MAdminMAdminViewScreen = () => {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [filter, setFilter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableCardData, setEditableCardData] = useState({});
  const [noEntries, setNoEntries] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "courses"), (snapshot) => {
      const fetchedCards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCards(fetchedCards);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = cards.filter(card => 
      card.school.toLowerCase().includes(filter.toLowerCase()) ||
      card.department.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [filter, cards]);

  const handleEdit = (card) => {
    setIsEditing(true);
    setEditableCardData(card);
  };

  const handleSave = async (id) => {
    setIsEditing(false);

    try {
      await setDoc(doc(db, "courses", id), editableCardData);
      setCards((prevCards) =>
        prevCards.map((card) => (card.id === id ? editableCardData : card))
      );
      Alert.alert("Post updated successfully");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleDeleteCard = async (id) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "courses", id));
            setCards((prevCards) => prevCards.filter((card) => card.id !== id));
            Alert.alert("Post deleted successfully");
          } catch (error) {
            console.error("Error deleting document: ", error);
          }
        },
      },
    ]);
  };

  const handleInputChange = (field, value) => {
    setEditableCardData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSemesterInputChange = (semesterIndex, field, value) => {
    const updatedSemesters = [...editableCardData.semesters];
    updatedSemesters[semesterIndex][field] = value;
    setEditableCardData((prevData) => ({
      ...prevData,
      semesters: updatedSemesters,
    }));
  };

  const handleSubjectInputChange = (semesterIndex, subjectIndex, field, value) => {
    const updatedSemesters = [...editableCardData.semesters];
    updatedSemesters[semesterIndex].subjects[subjectIndex][field] = value;
    setEditableCardData((prevData) => ({
      ...prevData,
      semesters: updatedSemesters,
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.inputBox}
          placeholder="Filter by School/Department"
          value={filter}
          onChangeText={setFilter}
        />
        <TouchableOpacity onPress={() => {}} style={styles.filterButton}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Filter</Text>
        </TouchableOpacity>
      </View>
      {filteredCards.length === 0 && noEntries && (
        <View style={styles.noEntriesContainer}>
          <Text style={styles.noEntriesText}>No entries found</Text>
        </View>
      )}

      {filteredCards.map((card) => (
        <View key={card.id} style={styles.card}>
          <Text style={styles.cardHeading}>Course Type:</Text>
          <TextInput
            style={[styles.input, isEditing ? null : styles.disabledInput]}
            editable={isEditing}
            value={isEditing ? editableCardData.courseType : card.courseType}
            onChangeText={(value) => handleInputChange("courseType", value)}
          />
          <Text style={styles.cardHeading}>School:</Text>
          <TextInput
            style={[styles.input, isEditing ? null : styles.disabledInput]}
            editable={isEditing}
            value={isEditing ? editableCardData.school : card.school}
            onChangeText={(value) => handleInputChange("school", value)}
          />
          <Text style={styles.cardHeading}>Department:</Text>
          <TextInput
            style={[styles.input, isEditing ? null : styles.disabledInput]}
            editable={isEditing}
            value={isEditing ? editableCardData.department : card.department}
            onChangeText={(value) => handleInputChange("department", value)}
          />
          <Text style={styles.cardHeading}>Semester Count:</Text>
          <TextInput
            style={[styles.input, isEditing ? null : styles.disabledInput]}
            editable={isEditing}
            value={
              isEditing ? editableCardData.semesterCount.toString() : card.semesterCount.toString()
            }
            onChangeText={(value) => handleInputChange("semesterCount", value)}
            keyboardType="numeric"
          />

          {card.semesters.map((semester, semesterIndex) => (
            <View key={`${card.id}-${semesterIndex}`} style={styles.semesterContainer}>
              <Text style={styles.semesterHeading}>Semester {semester.semesterNumber}</Text>
              {semester?.subjects.map((subject, subjectIndex) => (
                <View key={`${card.id}-${semesterIndex}-${subjectIndex}`} style={styles.subjectContainer}>
                  <Text style={styles.subjectHeading}>Subject {subjectIndex + 1}</Text>
                  <TextInput
                    style={[styles.input, isEditing ? null : styles.disabledInput]}
                    editable={isEditing}
                    value={
                      isEditing
                        ? editableCardData.semesters[semesterIndex]?.subjects[subjectIndex].name
                        : subject.name
                    }
                    onChangeText={(value) =>
                      handleSubjectInputChange(semesterIndex, subjectIndex, "name", value)
                    }
                    placeholder="Subject Name"
                  />
                  <TextInput
                    style={[styles.input, isEditing ? null : styles.disabledInput]}
                    editable={isEditing}
                    value={
                      isEditing
                        ? editableCardData.semesters[semesterIndex]?.subjects[subjectIndex].code
                        : subject.code
                    }
                    onChangeText={(value) =>
                      handleSubjectInputChange(semesterIndex, subjectIndex, "code", value)
                    }
                    placeholder="Subject Code"
                  />
                  <TextInput
                    style={[styles.input, isEditing ? null : styles.disabledInput]}
                    editable={isEditing}
                    value={
                      isEditing
                        ? editableCardData.semesters[semesterIndex]?.subjects[subjectIndex].credits
                        : subject.credits
                    }
                    onChangeText={(value) =>
                      handleSubjectInputChange(semesterIndex, subjectIndex, "credits", value)
                    }
                    placeholder="Subject Credits"
                  />
                  <TextInput
                    style={[styles.input, isEditing ? null : styles.disabledInput]}
                    editable={isEditing}
                    value={
                      isEditing
                        ? editableCardData.semesters[semesterIndex]?.subjects[subjectIndex].type
                        : subject.type
                    }
                    onChangeText={(value) =>
                      handleSubjectInputChange(semesterIndex, subjectIndex, "type", value)
                    }
                    placeholder="Subject Type"
                  />
                </View>
              ))}
            </View>
          ))}

          {isEditing ? (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => handleSave(card.id)} style={styles.editButton}>
                <Text style={{ color: "white" }}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => handleEdit(card)} style={styles.editButton}>
                <Text style={{ color: "white" }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteCard(card.id)} style={styles.deleteButton}>
                <Text style={{ color: "white" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "lightblue",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  inputBox: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderColor: "#74D1EA",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  filterButton: {
    backgroundColor: "#6488ea",
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  card: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#74D1EA",
    borderRadius: 5,
    backgroundColor: "white",
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderColor: "#74D1EA",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
  },
  semesterContainer: {
    marginTop: 10,
  },
  semesterHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subjectContainer: {
    marginBottom: 10,
  },
  subjectHeading: {
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#6495ED",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#FF4500",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  noEntriesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEntriesText: {
    fontSize: 18,
    color: "#333",
  },
});

export default MAdminMAdminViewScreen;
