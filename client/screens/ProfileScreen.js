import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import {
  updateUserProfilePic,
  updateUserDetails,
} from "../context/actions/authActions";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Button } from "react-native";

const ProfileScreen = () => {
  const auth = getAuth();
  const currentUser = auth?.currentUser;
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth.userProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [userData, setUserData] = useState({
    profilePic:
      userProfile.profilePic ||
      "https://ps.w.org/user-avatar-reloaded/assets/icon-256x256.png?rev=2540745.jpg",
    userName: "John Doeee",
    universityName: "Sample University",
    enrolledYear: "2020",
    currentState: "Studying",
    subjects: [
      { name: "Mathematics", code: "MATH101" },
      { name: "Physics", code: "PHY101" },
    ],
    additionalDetails: {
      courseType: "UG", // or "PG"
      email: "john@example.com",
      phone: "123-456-7890",
      address: "123 Main St, City",
      registrationNumber: "12345",
      rollNumber: "67890",
      departmentName: "Physics Department",
      schoolName: "Sample School",
    },
  });
  const userType = useSelector((state) => state.auth.userType);

  const [userNames, setUserNames] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserName(userType, uid);
    };

    fetchData();

    return () => {
      setUnmounted(true);
    };
  }, [userType, uid]);

  const { profilePic, userName, userEmail } = useSelector(
    (state) => state.auth
  );
  const { uid } = currentUser || {};

  useEffect(() => {
    if (currentUser) {
      fetchUserName(userType, uid);
    }
  }, [userType, uid, currentUser]);

  const fetchUserName = async (userType, userId) => {
    const collections = collection(db, `${userType}s`);
    const allDocs = await getDocs(collections);

    const fetchedDocs = [];
    for (const allDoc of allDocs.docs) {
      const authCollection = collection(db, `${userType}s`, allDoc.id, "auth");

      const q = query(authCollection);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedDocs.push({
          authId: doc.id,
          ...data,
        });
      });
    }
    setUserNames(fetchedDocs);
    setIsLoading(false);
  };

  useEffect(() => {
    if (userNames && userNames.length > 0 && currentUser && !unmounted) {
      const currentUserData = userNames.find(
        (user) => user.uid === currentUser.uid
      );
      if (currentUserData) {
        setUserData({
          profilePic: currentUserData.imageUrl || userData.profilePic,
          userName: currentUserData.name || userData.userName,
          universityName:
            currentUserData.universityName || userData.universityName,
          enrolledYear: currentUserData.enrolledYear || userData.enrolledYear,
          currentState: currentUserData.currentState || userData.currentState,
          subjects: userData.subjects,
          additionalDetails: {
            courseType:
              currentUserData.courseType ||
              userData.additionalDetails.courseType,
            email: currentUserData.email || userData.additionalDetails.email,
            phone:
              currentUserData.phoneNumber || userData.additionalDetails.phone,
            address:
              currentUserData.location || userData.additionalDetails.address,
            registrationNumber:
              currentUserData.registerNumber ||
              userData.additionalDetails.registrationNumber,
            rollNumber:
              currentUserData.rollNumber ||
              userData.additionalDetails.rollNumber,
            departmentName:
              currentUserData.department ||
              userData.additionalDetails.departmentName,
            schoolName:
              currentUserData.schoolName ||
              userData.additionalDetails.schoolName,
          },
        });
      } else {
        // Handle case when no user data is found for the current user
        console.error("No user data found for the current user.");
      }
    }
  }, [userNames, currentUser]);
  console.log(userNames?.map((data) => data.uid));

  useEffect(() => {
    dispatch(
      updateUserDetails(userData.userName, userData.additionalDetails.email)
    );
  }, [userData, dispatch]);

  const handleEdit = () => {
    setIsEditing(true);
    setShowDeleteIcon(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowDeleteIcon(false);
    setModalVisible(changesMade);
  };

  const handleInputChange = (field, value) => {
    setChangesMade(true);
    setUserData((prevData) => ({
      ...prevData,
      additionalDetails: {
        ...prevData.additionalDetails,
        [field]: value,
      },
    }));
  };

  const handleImageUpload = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        dispatch(updateUserProfilePic(selectedImage.uri));
        setUserData((prevData) => ({
          ...prevData,
          profilePic: selectedImage.uri,
        }));
        setChangesMade(true); // Changes have been made
      }
    } catch (error) {
      console.log("Error selecting image:", error);
      Alert.alert("Error", "An error occurred while selecting image");
    }
  };

  const handleDeleteProfilePic = () => {
    dispatch(updateUserProfilePic(null)); // Dispatch action to delete profile pic
    setUserData((prevData) => ({
      ...prevData,
      profilePic:
        "https://ps.w.org/user-avatar-reloaded/assets/icon-256x256.png?rev=2540745.jpg", // Reset profile pic to initial
    }));
    setChangesMade(true); // Changes have been made
  };

  const handleUpdateUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (userNames && userNames.length > 0) {
        const user = userNames[0];
        const userRef = doc(db, `${userType}s`, user.authId);
        await updateDoc(userRef, userData.additionalDetails);
        setModalVisible(true);
        setChangesMade(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            onPress={isEditing ? handleImageUpload : null}
            disabled={!isEditing}
          >
            <Image
              source={{ uri: userData.profilePic }}
              style={styles.profilePic}
            />
            {isEditing && (
              <AntDesign
                name="edit"
                size={24}
                color="black"
                style={styles.editIcon}
                onPress={handleImageUpload}
              />
            )}
            {showDeleteIcon && (
              <TouchableOpacity onPress={handleDeleteProfilePic}>
                <FontAwesome
                  name="trash"
                  size={24}
                  color="red"
                  style={styles.deleteIcon}
                />
              </TouchableOpacity>
            )}
            {isEditing ? (
              <TouchableOpacity onPress={handleSave}>
                <AntDesign
                  name="save"
                  size={24}
                  color="black"
                  style={styles.saveIcon}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleEdit}>
                <AntDesign
                  name="edit"
                  size={24}
                  color="black"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{userData.userName}</Text>
          <Text style={styles.universityName}>{userData.universityName}</Text>
          <Text style={styles.email}>{userData.additionalDetails.email}</Text>
        </View>

        <View style={styles.additionalDetailsContainer}>
          <Text style={styles.additionalDetailsTitle}>Additional Details</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Course Type</Text>
                <TextInput
                  style={styles.input}
                  value={userData.additionalDetails.courseType}
                  onChangeText={(text) => handleInputChange("courseType", text)}
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={userData.additionalDetails.phone}
                  onChangeText={(text) => handleInputChange("phone", text)}
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={userData.additionalDetails.address}
                  onChangeText={(text) => handleInputChange("address", text)}
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Roll Number</Text>
                <TextInput
                  style={styles.input}
                  value={userData.additionalDetails.rollNumber}
                  onChangeText={(text) => handleInputChange("rollNumber", text)}
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Registration Number</Text>
                <TextInput
                  style={styles.input}
                  value={userData.additionalDetails.registrationNumber}
                  onChangeText={(text) =>
                    handleInputChange("registrationNumber", text)
                  }
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>School Name</Text>
                <TextInput
                  style={styles.input}
                  value={userData.additionalDetails.schoolName}
                  onChangeText={(text) => handleInputChange("schoolName", text)}
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Department Name</Text>
                <TextInput
                  style={styles.input}
                  value={userData.additionalDetails.departmentName}
                  onChangeText={(text) =>
                    handleInputChange("departmentName", text)
                  }
                  editable={isEditing}
                />
              </View>
              <View style={styles.buttonContainer}>
                {isEditing ? (
                  <>
                    <Button
                      title="Update"
                      onPress={handleUpdateUser}
                      disabled={isLoading}
                    />
                    <Button title="Cancel" onPress={handleSave} />
                  </>
                ) : (
                  <Button title="Edit" onPress={handleEdit} />
                )}
              </View>
            </>
          )}
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Profile Updated Successfully!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  editIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 15,
  },
  saveIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 15,
  },
  deleteIcon: {
    position: "absolute",
    left: 0,
    bottom: 0,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  universityName: {
    fontSize: 18,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    marginBottom: 5,
  },
  enrolledYear: {
    fontSize: 16,
    marginBottom: 5,
  },
  currentState: {
    fontSize: 16,
    marginBottom: 5,
  },
  subjectsContainer: {
    marginBottom: 20,
  },
  subjectsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subjectColumn: {
    flex: 1,
    alignItems: "flex-start",
  },
  subject: {
    fontSize: 16,
    marginBottom: 5,
  },
  semester: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  additionalDetailsContainer: {
    marginTop: 20,
  },
  additionalDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  error: {
    color: "red",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FEBE10",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
export default ProfileScreen;
