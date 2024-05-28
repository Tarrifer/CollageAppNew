import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import moment from "moment";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Ensure you import your Firebase configuration
import { getAuth } from "firebase/auth";
import { RefreshControl } from "react-native";

const TimetableCard = ({
  startTime,
  endTime,
  subjectName,
  teacherName,
  start,end,
  onEdit,
  onDelete,
  slot,
}) => (
  <View style={styles.timetableCard}>
    <View style={styles.timetableCardContent}>
      <Text style={styles.timetableCardText}>
        Subject: {subjectName}
      </Text>
      <Text style={styles.timetableCardText}>
        Start Time: {start}
      </Text>
      <Text style={styles.timetableCardText}>
        End Time: {end}
      </Text>
      <Text style={styles.timetableCardText}>
        Teacher: {teacherName}
      </Text>
    </View>
    <View style={styles.timetableCardActions}>
      {/* Uncomment the following lines if you want to enable editing */}
      {/* <TouchableOpacity style={styles.editButton} onPress={() => onEdit(slot)}>
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity> */}
      {/* <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(slot)}
      >
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity> */}
    </View>
  </View>
);

const AdminTimetableView = () => {
  const [schoolName, setSchoolName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [semester, setSemester] = useState("");
  const [timetable, setTimetable] = useState([]);
  const [index, setIndex] = useState(0);
  const [editingSlot, setEditingSlot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimetable = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const timetablesCollection = collection(
        db,
        "Admins",
        user?.uid,
        "timetables"
      );
      const timetableQuery = query(timetablesCollection);
      const timetableSnapshot = await getDocs(timetableQuery);

      const timetableData = timetableSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTimetable(timetableData);
    } catch (error) {
      console.error("Error fetching timetable: ", error);
    }
  };
  useEffect(() => {
    fetchTimetable();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTimetable().then(() => setRefreshing(false));
  }, []);

  const handleFilter = () => {
    const filteredTimetable = timetable.filter(
      (timetable) =>
        timetable.department === departmentName &&
        timetable.semester === semester
    );

    setTimetable(filteredTimetable);
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setModalVisible(true);
  };

  const handleDelete = (slot) => {
    Alert.alert(
      "Delete Timetable Slot",
      "Are you sure you want to delete this timetable slot?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteSlot(slot),
          style: "destructive",
        },
      ]
    );
  };

  const deleteSlot = async (slot) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const timetableDocRef = doc(
        db,
        "Admins",
        user?.uid,
        "timetables",
        slot.timetableId
      );
      const timetableDoc = await getDocs(timetableDocRef);
      const timetableData = timetableDoc.data();

      const updatedTimetable = timetableData.timetable.filter(
        (t) => t !== slot
      );

      await updateDoc(timetableDocRef, { timetable: updatedTimetable });

      setTimetable((prevTimetable) =>
        prevTimetable.map((timetable) =>
          timetable.id === slot.timetableId
            ? { ...timetable, timetable: updatedTimetable }
            : timetable
        )
      );
    } catch (error) {
      console.error("Error deleting timetable slot: ", error);
      Alert.alert(
        "Error",
        "Failed to delete timetable slot. Please try again."
      );
    }
  };

  const routes = [
    { key: "monday", title: "Monday" },
    { key: "tuesday", title: "Tuesday" },
    { key: "wednesday", title: "Wednesday" },
    { key: "thursday", title: "Thursday" },
    { key: "friday", title: "Friday" },
  ];

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled={false}
      style={{ backgroundColor: "#fff" }}
      indicatorStyle={{ backgroundColor: "#007bff" }}
      tabStyle={{ width: 100 }}
      labelStyle={{ textAlign: "center" }}
    />
  );

  const renderTabView = ({ navigationState }) => {
    const dayTimetable = timetable.filter(
      (timetable) =>
        moment(timetable.createdAt).format("dddd") === moment().format("dddd")
    );

    console.log(dayTimetable)

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.timetableContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {dayTimetable.map((timetable, index) => (
            <View key={index}>
              {timetable.timetable.map((slot, slotIndex) => (
                <TimetableCard
                  key={slotIndex}
                  duration={`${slot.start} - ${slot.end}`}
                  subjectName={slot.subject}
                  teacherName={slot.teacher || "N/A"}
                  end={slot.end}
                  start={slot.start}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  slot={{ ...slot, timetableId: timetable.id }}
                />
              ))}
            </View>
          ))}
        </ScrollView>
        {/* Add Modal for editing slots */}
        
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          placeholder="Department Name"
          value={departmentName}
          onChangeText={setDepartmentName}
        />
        <TextInput
          style={styles.input}
          placeholder="Semester"
          value={semester}
          onChangeText={setSemester}
        />
        <TouchableOpacity style={styles.button} onPress={handleFilter}>
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderTabView}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginHorizontal: 5,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  timetableContainer: {
    flex: 1,
    padding: 10,
  },
  timetableCard: {
    backgroundColor: "#f2f2f2",
    marginVertical: 5,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  timetableCardContent: {
    flex: 1,
  },
  timetableCardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  timetableCardActions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default AdminTimetableView;
