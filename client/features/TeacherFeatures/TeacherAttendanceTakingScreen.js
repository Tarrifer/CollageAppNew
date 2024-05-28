import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, storage } from "../../../lib/firebase"; // Adjust the import path as needed
import * as MailComposer from "expo-mail-composer";
import * as FileSystem from "expo-file-system";
import Checkbox from "expo-checkbox";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const TeacherAttendanceTakingScreen = () => {
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const [refreshing, setRefreshing] = useState(false); // Refresh state
  const navigation = useNavigation();
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const studentCollection = collection(db, "Students");
      const studentDocs = await getDocs(studentCollection);

      const fetchedStudents = [];

      for (const studentDoc of studentDocs.docs) {
        const authCollection = collection(
          db,
          "Students",
          studentDoc.id,
          "auth"
        );
        const q = query(authCollection, where("isApproved", "==", true));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedStudents.push({
            id: studentDoc.id,
            authId: doc.id,
            ...data,
          });
        });
      }
      setStudents(fetchedStudents);
      setFilteredStudents(fetchedStudents); // Set filtered students to all students initially
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleFilterStudents = () => {
    if (department) {
      const filtered = students.filter(
        (student) =>
          student.department.toLowerCase() === department.toLowerCase()
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students); // Reset to all students if no department is selected
    }
  };

  const resetFilter = async () => {
    setDepartment("");
    await fetchStudents(); // Ensure the data is fetched again
    setFilteredStudents(students); // Reset filtered students to all students
  };

  const handleCapturePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const submitAttendance = async () => {
    setIsSubmitting(true); // Start loading state
    let imageUrl = "";
    let imageUri = "";

    if (photo) {
      const response = await fetch(photo);
      const blob = await response.blob();
      const imageRef = ref(
        storage,
        `attendance/${Date.now()}-${Math.random().toString(36)}`
      );
      await uploadBytes(imageRef, blob);
      imageUrl = await getDownloadURL(imageRef);

      // Handle file URI for Android
      if (Platform.OS === "android") {
        const downloadedFile =
          FileSystem.cacheDirectory + "attendancePhoto.jpg";
        const { uri } = await FileSystem.downloadAsync(
          imageUrl,
          downloadedFile
        );
        imageUri = uri;
      } else {
        imageUri = imageUrl;
      }
    }

    const emailBody = `Dear Student,
  
  Your attendance has been taken successfully for the subject: ${subject}.
  
  Regards,
  Teacher`;

    const emailOptions = {
      recipients: selectedStudents.map((student) => student.email),
      subject: "Attendance Confirmation",
      body: emailBody,
      attachments: imageUri ? [imageUri] : [],
    };

    try {
      const result = await MailComposer.composeAsync(emailOptions);
      if (result.status === "sent") {
        console.log("Emails sent to all selected students");
      } else {
        console.log("Email sending cancelled or failed");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
    }

    // Save attendance data for selected students
    const attendanceData = {
      subject,
      date: new Date(),
      imageUrl: imageUrl || null,
    };

    const batch = writeBatch(db);
    selectedStudents.forEach((student) => {
      const attendanceRef = doc(
        db,
        "Students",
        student.id,
        "attendance",
        Date.now().toString()
      );
      const studentAttendanceData = {
        ...attendanceData,
        email: student.email,
      };
      batch.set(attendanceRef, studentAttendanceData);
    });

    await batch.commit();

    setSelectedStudents([]);
    setPhoto(null);
    setIsSubmitting(false); // End loading state

    Alert.alert(
      "Attendance Submitted",
      "Attendance has been successfully submitted."
    );
  };

  const handleStudentSelection = (student) => {
    const index = selectedStudents.findIndex(
      (selected) => selected.id === student.id
    );
    if (index !== -1) {
      const updatedSelectedStudents = [...selectedStudents];
      updatedSelectedStudents.splice(index, 1);
      setSelectedStudents(updatedSelectedStudents);
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.cameraIconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Facedetection")}>
          <Ionicons name="camera" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.cameraIconText}>Face Detection</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Text>Select Department:</Text>
        <Picker
          selectedValue={department}
          onValueChange={(itemValue, itemIndex) => {
            setDepartment(itemValue);
            handleFilterStudents(); // Update filter when department changes
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Department" value="" />
          <Picker.Item label="CSE" value="cse" />
          <Picker.Item label="ECE" value="ece" />
          <Picker.Item label="CE" value="ce" />
          <Picker.Item label="ME" value="me" />
          {/* Add more departments as needed */}
        </Picker>
        <Button title="Filter" onPress={handleFilterStudents} />
        <Button title="Reset Filter" onPress={resetFilter} />
      </View>
      <FlatList
        data={filteredStudents}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.studentInfo}>
              <Text>{`Student Name: ${item.name}`}</Text>
              <Text>{`Department: ${item.department}`}</Text>
              <Text>{`Roll No: ${item.rollNumber}`}</Text>
            </View>
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={selectedStudents.some(
                  (student) => student.id === item.id
                )}
                onValueChange={() => handleStudentSelection(item)}
              />
            </View>
            <Image
              style={styles.studentImage}
              source={{ uri: item.imageUrl }}
            />
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.container}>
            <View style={styles.pickerContainer}>
              <Text>Select Subject:</Text>
              <Picker
                selectedValue={subject}
                onValueChange={(itemValue, itemIndex) => setSubject(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Subject" value="" />
                <Picker.Item label="Subject 1" value="Subject 1" />
                <Picker.Item label="Subject 2" value="Subject 2" />
                {/* Add more subjects as needed */}
              </Picker>
            </View>

            {photo && (
              <Image source={{ uri: photo }} style={styles.imagePreview} />
            )}
          </View>
        )}
        ListEmptyComponent={() => <Text>No data found</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <Button title="Take Attendance Photo" onPress={handleCapturePhoto} />
      <Button
        title={isSubmitting ? "Submitting..." : "Submit Attendance"}
        onPress={submitAttendance}
        disabled={isSubmitting}
      />
      {isSubmitting && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

export default TeacherAttendanceTakingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  cameraIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  cameraIconText: {
    marginLeft: 10,
    fontSize: 18,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  studentInfo: {
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 10, // Adjust as needed
  },
  studentImage: {
    width: 50, // Adjust width and height as needed
    height: 50,
    borderRadius: 25, // Make it a circle
  },
  imagePreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 16,
    borderRadius: 8,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginVertical: 16,
    borderRadius: 8,
  },
});
