import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Ensure you import your Firebase configuration
import { getAuth } from "firebase/auth";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const AdminTimetableCreate = () => {
  const [department, setDepartment] = useState("CEN");
  const [semester, setSemester] = useState("Fall");
  const [timetable, setTimetable] = useState({
    Mon: {},
  });
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const handleSave = async () => {
    const hasEmptySlots = Object.values(timetable).some((day) =>
      Object.values(day).some((slot) => !slot.subject)
    );

    if (hasEmptySlots) {
      Alert.alert(
        "There are empty slots or days without subjects. Are you sure you want to save the timetable?",
        "",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: () => saveTimetableToDatabase() },
        ]
      );
    } else {
      saveTimetableToDatabase();
    }
  };

  const saveTimetableToDatabase = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      // Convert the timetable object to an array
      const flatTimetable = Object.entries(timetable).flatMap(([day, slots]) =>
        Object.entries(slots).map(([slot, { subject, start, end, teacher }]) => ({
          day,
          slot,
          subject,
          teacher,
          start,
          end,
        }))
      );

      await addDoc(collection(db, "Admins", user.uid, "timetables"), {
        department,
        semester,
        timetable: flatTimetable,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
      Alert.alert("Timetable saved successfully!");
      clearInputFields();
    } catch (error) {
      console.error("Error saving timetable: ", error);
      Alert.alert("Error saving timetable. Please try again.");
    }
  };

  const handleSlotChange = (day, slot, field, value) => {
    setTimetable((prevTimetable) => ({
      ...prevTimetable,
      [day]: {
        ...prevTimetable[day],
        [slot]: {
          ...prevTimetable[day][slot],
          [field]: value,
        },
      },
    }));
  };

  const addNextDay = () => {
    if (currentDayIndex < daysOfWeek.length - 1) {
      const nextDayIndex = currentDayIndex + 1;
      const nextDay = daysOfWeek[nextDayIndex];
      setTimetable((prevTimetable) => ({
        ...prevTimetable,
        [nextDay]: {},
      }));
      setCurrentDayIndex(nextDayIndex);
    } else {
      Alert.alert("All days have been added.");
    }
  };

  const clearInputFields = () => {
    setTimetable({
      Mon: {},
    });
    setCurrentDayIndex(0);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.timetableContainer}>
        <Text style={styles.headerText}>Create Timetable</Text>
        {/* Department and semester pickers */}
        <View style={styles.pickerContainer}>
          <Text style={styles.labelText}>Department:</Text>
          <Picker
            selectedValue={department}
            onValueChange={(value) => setDepartment(value)}
            style={styles.picker}
          >
            <Picker.Item label="CEN" value="CEN" />
            <Picker.Item label="EEE" value="EEE" />
            <Picker.Item label="CSE" value="CSE" />
            {/* Add more departments as needed */}
          </Picker>
          <Text style={styles.labelText}>Semester:</Text>
          <Picker
            selectedValue={semester}
            onValueChange={(value) => setSemester(value)}
            style={styles.picker}
          >
            <Picker.Item label="Fall" value="Fall" />
            <Picker.Item label="Spring" value="Spring" />
            {/* Add more semesters as needed */}
          </Picker>
        </View>

        {Object.entries(timetable).map(([day, slots]) => (
          <View key={day} style={styles.dayContainer}>
            <Text style={styles.dayHeaderText}>{day}</Text>
            {Array.from({ length: 9 }, (_, index) => index + 1).map(
              (slot) => (
                <View key={slot} style={styles.slotContainer}>
                  <Text style={styles.slotHeaderText}>Slot {slot}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Subject Name"
                    value={slots[`Slot ${slot}`]?.subject || ""}
                    onChangeText={(text) =>
                      handleSlotChange(day, `Slot ${slot}`, "subject", text)
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Teacher Name"
                    value={slots[`Slot ${slot}`]?.teacher || ""}
                    onChangeText={(text) =>
                      handleSlotChange(day, `Slot ${slot}`, "teacher", text)
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Start Time"
                    value={slots[`Slot ${slot}`]?.start || ""}
                    onChangeText={(text) =>
                      handleSlotChange(day, `Slot ${slot}`, "start", text)
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="End Time"
                    value={slots[`Slot ${slot}`]?.end || ""}
                    onChangeText={(text) =>
                      handleSlotChange(day, `Slot ${slot}`, "end", text)
                    }
                  />
                </View>
              )
            )}
          </View>
        ))}

        {currentDayIndex < daysOfWeek.length - 1 && (
          <TouchableOpacity style={styles.button} onPress={addNextDay}>
            <Text style={styles.buttonText}>Add Next Day</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Timetable</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  timetableContainer: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  labelText: {
    fontSize: 18,
    marginBottom: 10,
  },
  picker: {
    marginBottom: 10,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  slotContainer: {
    marginBottom: 10,
  },
  slotHeaderText: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});

export default AdminTimetableCreate;
