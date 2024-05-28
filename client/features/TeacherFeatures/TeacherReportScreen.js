import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, where, query } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Auth to get current user

const TeacherReportScreen = () => {
  const [reportType, setReportType] = useState("");
  const [senderType, setSenderType] = useState("");
  const [description, setDescription] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const reportTypes = [
    "Report General",
    "Report Collage",
    "Report Dept.",
    "Report Subject",
    "Report Student",
    "Report Teacher",
    "Report TimeTable",
    "Report Attendance",
    "Report Calendar",
    "Report Technical",
    "Report Non-Technical",
  ];

  const senderTypes = ["Teacher"];

  const submitReport = async () => {
    if (!reportType || !senderType || !description) {
      setShowErrorAlert(true);
      return;
    }
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    console.log(user);
  
    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }
  
    let adminName = "";
    try {
      const studentCollection = collection(db, "Students");
      const studentDocs = await getDocs(studentCollection);
      for (const studentDoc of studentDocs.docs) {
        const authCollection = collection(db, "Students", studentDoc.id, "auth");
  
        const q = query(authCollection, where("isApproved", "==", true));
        const querySnapshot = await getDocs(q);
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(data, "data")
          adminName = data.name
        });
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      Alert.alert("Error", "Failed to fetch student data");
      return;
    }
  
    // Prepare report data
    const reportData = {
      reportType,
      senderType,
      description,
      submissionDate: serverTimestamp(),
      studentUID: user.uid,
      adminName: adminName, // Include student's name in report data
    };
  
    try {
      // Save the report to Firestore subcollection under the authenticated student's document
      const userDocRef = await addDoc(collection(db, "Students"), {});
      await addDoc(
        collection(db, "Students", userDocRef.id, "reports"),
        reportData
      );
      setShowSuccessAlert(true);
  
      // Reset inputs
      setReportType("");
      setSenderType("");
      setDescription("");
    } catch (error) {
      console.error("Error saving report to Firestore:", error);
      Alert.alert("Error", "Failed to submit the report. Please try again.");
    }
  };
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Student Report</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Report Type:</Text>
        <Picker
          selectedValue={reportType}
          style={[styles.dropdown, styles.pickerBackground]}
          onValueChange={(itemValue, itemIndex) => setReportType(itemValue)}
        >
          <Picker.Item label="Select Report Type" value="" />
          {reportTypes.map((type, index) => (
            <Picker.Item key={index} label={type} value={type} />
          ))}
        </Picker>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Sender Type:</Text>
        <Picker
          selectedValue={senderType}
          style={[styles.dropdown, styles.pickerBackground]}
          onValueChange={(itemValue, itemIndex) => setSenderType(itemValue)}
        >
          <Picker.Item label="Select Sender Type" value="" />
          {senderTypes.map((type, index) => (
            <Picker.Item key={index} label={type} value={type} />
          ))}
        </Picker>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          multiline
          numberOfLines={4}
          placeholder="Enter report description"
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
      </View>
      <Button title="Submit" onPress={submitReport} />

      {/* Error Alert */}
      <Modal visible={showErrorAlert} animationType="fade" transparent>
        <View style={styles.alertContainer}>
          <View style={styles.alert}>
            <Text style={styles.alertText}>
              Please fill all inputs and choose from the lists.
            </Text>
            <Button title="OK" onPress={() => setShowErrorAlert(false)} />
          </View>
        </View>
      </Modal>

      {/* Success Alert */}
      <Modal visible={showSuccessAlert} animationType="fade" transparent>
        <View style={styles.alertContainer}>
          <View style={[styles.alert, styles.successAlert]}>
            <Text style={styles.alertText}>The report has been sent.</Text>
            <Button title="OK" onPress={() => setShowSuccessAlert(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#87CEEB",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    backgroundColor: "#fff",
  },
  pickerBackground: {
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  alertContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alert: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  successAlert: {
    backgroundColor: "#4CAF50",
  },
  alertText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default TeacherReportScreen;
