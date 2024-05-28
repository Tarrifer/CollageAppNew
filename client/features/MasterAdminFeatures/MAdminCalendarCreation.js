import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { db } from "../../../lib/firebase"; // Adjust the import path as needed
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  getDocs,
} from "firebase/firestore";

const MAdminCalendarCreation = () => {
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const masterAdminCollection = collection(db, "Master Admins");
      const masterAdminDocs = await getDocs(masterAdminCollection);
      const fetchedEvents = [];

      for (const adminDoc of masterAdminDocs.docs) {
        const eventsCollection = collection(
          db,
          "Master Admins",
          adminDoc.id,
          "events"
        );
        const eventsQuery = query(eventsCollection);
        const querySnapshot = await getDocs(eventsQuery);
        querySnapshot.forEach((eventDoc) => {
          fetchedEvents.push({
            id: eventDoc.id,
            adminId: adminDoc.id,
            ...eventDoc.data(),
          });
        });
      }
      setEvents(fetchedEvents);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch events");
      console.error("Error fetching events: ", error);
    }
  };

  const handleAddEvent = async () => {
    if (!eventName || !eventDate) {
      Alert.alert("Error", "Please fill in the event name and select a date");
      return;
    }

    const newEvent = {
      name: eventName,
      date: eventDate,
      description: eventDescription,
    };

    try {
      const userDocRef = await addDoc(collection(db, "Master Admins"), {});

      // Add the event to the "events" subcollection
      const eventDocRef = await addDoc(
        collection(db, "Master Admins", userDocRef.id, "events"),
        newEvent
      );
      setEvents([
        ...events,
        { id: eventDocRef.id, adminId: userDocRef.id, ...newEvent },
      ]);
      setEventName("");
      setEventDescription("");
      Alert.alert("Success", "Event added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to add event");
      console.error("Error adding event: ", error);
    }
  };

  const handleDeleteEvent = async (index) => {
    if (index < 0 || index >= events.length) {
      Alert.alert("Error", "Invalid event index");
      return;
    }

    const eventToDelete = events[index];

    try {
      await deleteDoc(
        doc(
          db,
          "Master Admins",
          eventToDelete.adminId,
          "events",
          eventToDelete.id
        )
      );

      // Remove the event from the local state
      const updatedEvents = [...events];
      updatedEvents.splice(index, 1);
      setEvents(updatedEvents);
      Alert.alert("Success", "Event deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete event");
      console.error("Error deleting event: ", error);
    }
  };

  const handleDatePress = (date) => {
    setSelectedDate(date.dateString);
    setEventDate(date.dateString);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>University Calendar Creation</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Event Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Event Name"
            onChangeText={(text) => setEventName(text)}
            value={eventName}
          />
        </View>

        <Calendar
          current={new Date().toISOString().split("T")[0]}
          onDayPress={handleDatePress}
          markedDates={{ [selectedDate]: { selected: true, marked: true } }}
          theme={{
            selectedDayBackgroundColor: "#00adf5",
            todayTextColor: "#00adf5",
            arrowColor: "orange",
          }}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Event Description:</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Enter Event Description"
            multiline={true}
            onChangeText={(text) => setEventDescription(text)}
            value={eventDescription}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>

        <View style={styles.eventsContainer}>
          <Text style={styles.eventsHeading}>Events</Text>
          {events.map((event, index) => (
            <View key={index} style={styles.eventCard}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
                {event.description && (
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => handleDeleteEvent(index)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: {
    marginVertical: 14,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#00adf5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventsContainer: {
    marginTop: 20,
  },
  eventsHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#AFE1AF",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  eventDate: {
    color: "gray",
    fontWeight: "bold",
    fontSize: 16,
  },
  eventDescription: {
    marginTop: 5,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "red",
    color: "white",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MAdminCalendarCreation;
