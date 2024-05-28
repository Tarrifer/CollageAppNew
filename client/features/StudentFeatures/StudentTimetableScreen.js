import React, { useEffect, useState } from "react";
import { View, StyleSheet, BackHandler, RefreshControl } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  SundayScreen,
  MondayScreen,
  TuesdayScreen,
  WednesdayScreen,
  ThursdayScreen,
  FridayScreen,
  SaturdayScreen,
} from "./StudentDayTimetableScreen";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Ensure you import your Firebase configuration

const Tab = createMaterialTopTabNavigator();

function StudentTimetableScreen() {
  const navigation = useNavigation();
  const [tabIndex, setTabIndex] = useState(0); // State variable to track the current tab index
  const [timetable, setTimetable] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimetable = async (dayIndex) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      console.log("User authenticated:", user.uid); // Debug log

      const timetablesCollection = collection(
        db,
        "Admins",
        user.uid,
        "timetables"
      );
      const timetableQuery = query(timetablesCollection);
      const timetableSnapshot = await getDocs(timetableQuery);

      if (timetableSnapshot.empty) {
        console.log("No timetable documents found.");
        setTimetable([]);
        return;
      }

      const timetableData = timetableSnapshot.docs.map((doc) => {
        console.log("Doc data:", doc.data()); // Debug log
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      console.log("Timetable data:", timetableData); // Debug log

      // Filter timetable data based on the current day
      const filteredTimetable = timetableData.filter((timetable) => {
        console.log("Filtering for day:", `Day ${dayIndex + 1}`);
        console.log("Timetable day:", timetable.day);
        return timetable.day === `Day ${dayIndex + 1}`;
      });

      console.log("Filtered timetable:", filteredTimetable); // Debug log

      setTimetable(filteredTimetable);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimetable(tabIndex).then(() => setRefreshing(false));
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (tabIndex > 0 && tabIndex < 7) {
          // If on one of the tab screens (Monday to Saturday), navigate back as if the back button was pressed twice
          navigation.dispatch(CommonActions.goBack());
          return true; // Prevent default back action
        } else {
          // Allow default back action
          return false;
        }
      }
    );

    return () => backHandler.remove();
  }, [navigation, tabIndex]);
  useEffect(() => {
    const dayIndex = new Date().getDay();
    console.log("Current day index:", dayIndex);
    setTabIndex(dayIndex);
    fetchTimetable(dayIndex);

    switch (dayIndex) {
      case 0:
        navigation.navigate("Sun");
        break;
      case 1:
        navigation.navigate("Mon");
        break;
      case 2:
        navigation.navigate("Tue");
        break;
      case 3:
        navigation.navigate("Wed");
        break;
      case 4:
        navigation.navigate("Thu");
        break;
      case 5:
        navigation.navigate("Fri");
        break;
      case 6:
        navigation.navigate("Sat");
        break;
      default:
        navigation.navigate("Sun");
        break;
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
          tabBarStyle: { backgroundColor: "powderblue" },
        }}
      >
        <Tab.Screen
          name="Sun"
          children={() => <SundayScreen timetable={timetable} />}
        />
        <Tab.Screen
          name="Mon"
          children={() => <MondayScreen timetable={timetable} />}
        />
        <Tab.Screen
          name="Tue"
          children={() => <TuesdayScreen timetable={timetable} />}
        />
        <Tab.Screen
          name="Wed"
          children={() => <WednesdayScreen timetable={timetable} />}
        />
        <Tab.Screen
          name="Thu"
          children={() => <ThursdayScreen timetable={timetable} />}
        />
        <Tab.Screen
          name="Fri"
          children={() => <FridayScreen timetable={timetable} />}
        />
        <Tab.Screen
          name="Sat"
          children={() => <SaturdayScreen timetable={timetable} />}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "blue",
  },
  tabBar: {
    backgroundColor: "#007bff",
  },
});

export default StudentTimetableScreen;
