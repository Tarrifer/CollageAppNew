import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { db } from "../../lib/firebase";
import { SafeAreaView } from "react-native-safe-area-context";

const CalendarScreen = () => {
  // Sample events data
  const [events, setEvents] = useState([]);


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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View>
          <Text style={styles.heading}>Calendar</Text>
          {events.length === 0 ? (
            <Text>No data found</Text>
          ) : (
            events.map((event, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6347",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6347",
  },
  eventDate: {
    fontSize: 16,
    color: "gray",
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 16,
  },
});

export default CalendarScreen;
