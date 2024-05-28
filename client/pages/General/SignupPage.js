import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { signUp, storage } from "../../../lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

const SignupPage = () => {
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    schoolName: "",
    department: "",
    registerNumber: "",
    rollNumber: "",
    phoneNumber: "",
    userType: "",
    universityName: "",
    country: "",
    location: "",
    universityCode: "",
    postcode: "",
    city: "",
    address: "",
  });

  const [userImage, setUserImage] = useState(null);
  const navigation = useNavigation();

  const [url, setUrl] = useState("");
  const [imageList, setImageList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (signUpForm.userType === "Master Admin") {
      setUserImage(null);
    }
  }, [signUpForm.userType]);

  const handleChange = (field, value) => {
    setSignUpForm((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access photos"
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        if (result.assets && result.assets.length > 0) {
          setUserImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.log("Error selecting image:", error);
      Alert.alert("Error", "An error occurred while selecting image");
    }
  };

  const handleRemoveImage = () => {
    setUserImage(null);
  };

  const handleSignup = async () => {
    if (
      !signUpForm.email ||
      !signUpForm.password ||
      !signUpForm.confirmPassword ||
      !signUpForm.name ||
      !signUpForm.schoolName ||
      !signUpForm.department ||
      !signUpForm.registerNumber ||
      !signUpForm.rollNumber ||
      !signUpForm.phoneNumber ||
      !signUpForm.userType
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
  
    if (signUpForm.password !== signUpForm.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
  
    /*if (!userImage && signUpForm.userType !== "Master Admin") {
      Alert.alert("Please upload image");
      return;
    }*/
  
    setIsSubmitting(true);
  
    try {
      let imageUrl = "";
  
      if (userImage) {
        const response = await fetch(userImage);
        const blob = await response.blob();
        const imageRef = ref(storage, `user-images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        const snapshot = await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
  
      const user = await signUp(
        signUpForm.email,
        signUpForm.password,
        signUpForm.name,
        signUpForm.schoolName,
        signUpForm.department,
        signUpForm.registerNumber,
        signUpForm.rollNumber,
        signUpForm.phoneNumber,
        signUpForm.userType,
        imageUrl,
        signUpForm.universityName,
        signUpForm.country,
        signUpForm.location,
        signUpForm.universityCode,
        signUpForm.postcode,
        signUpForm.city,
        signUpForm.address
      );

      if (user){
        Alert.alert("Success", "Signup successful!");
        navigation.navigate("Login")

      }
  
      // navigation.navigate("OTPVerification", { userType: signUpForm.userType });
    } catch (error) {
      console.log("Error during signup:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNK57Oj5ro7C-aFzfBHXuesubrY8lbH4Bxew&s.png",
            }}
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Sign Up to your Account</Text>
        </View>

        <KeyboardAvoidingView style={styles.formContainer} behavior="padding">
          <View style={styles.inputContainer}>
            <Text style={styles.label}>User Type:</Text>
            <Picker
              selectedValue={signUpForm.userType}
              onValueChange={(itemValue) => handleChange("userType", itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Choose User Type" value="" />
              <Picker.Item label="Student" value="Student" />
              <Picker.Item label="Teacher" value="Teacher" />
              <Picker.Item label="Admin" value="Admin" />
              <Picker.Item label="Master Admin" value="Master Admin" />
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Department:</Text>
            <Picker
              selectedValue={signUpForm.department}
              onValueChange={(itemValue) => handleChange("department", itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Select Department" value="" />
              <Picker.Item label="CSE" value="CSE" />
              <Picker.Item label="ECE" value="ECE" />
              <Picker.Item label="ME" value="ME" />
              <Picker.Item label="CE" value="CE" />
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={signUpForm.name}
                onChangeText={(text) => handleChange("name", text)}
                style={styles.input}
                placeholder="Enter your name"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                style={styles.inputIcon}
                name="school"
                size={24}
                color="gray"
              />
              <TextInput
                value={signUpForm.schoolName}
                onChangeText={(text) => handleChange("schoolName", text)}
                style={styles.input}
                placeholder="Enter your school name"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                style={styles.inputIcon}
                name="fingerprint"
                size={24}
                color="gray"
              />
              <TextInput
                value={signUpForm.registerNumber}
                onChangeText={(text) => handleChange("registerNumber", text)}
                style={styles.input}
                placeholder="Enter your register number"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                style={styles.inputIcon}
                name="rollupjs"
                size={24}
                color="gray"
              />
              <TextInput
                value={signUpForm.rollNumber}
                onChangeText={(text) => handleChange("rollNumber", text)}
                style={styles.input}
                placeholder="Enter your roll number"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                style={styles.inputIcon}
                name="phone"
                size={24}
                color="gray"
              />
              <TextInput
                value={signUpForm.phoneNumber}
                onChangeText={(text) => handleChange("phoneNumber", text)}
                style={styles.input}
                placeholder="Enter your phone number"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                style={styles.inputIcon}
                name="email"
                size={24}
                color="gray"
              />
              <TextInput
                value={signUpForm.email}
                onChangeText={(text) => handleChange("email", text)}
                style={styles.input}
                placeholder="Enter your Email"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <AntDesign
                name="lock1"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={signUpForm.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={true}
                style={styles.input}
                placeholder="Enter your Password"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <AntDesign
                name="lock1"
                size={24}
                color="gray"
                style={styles.inputIcon}
              />
              <TextInput
                value={signUpForm.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                secureTextEntry={true}
                style={styles.input}
                placeholder="Confirm Password"
              />
            </View>
          </View>

          {!userImage && signUpForm.userType !== "Master Admin" && (
            <View style={styles.inputContainer}>
              <Pressable
                onPress={handleImageUpload}
                style={styles.uploadButton}
              >
                <Text style={styles.buttonText}>Upload Image</Text>
              </Pressable>
            </View>
          )}
          {userImage && (
            <View style={styles.inputContainer}>
              <Pressable
                onPress={handleRemoveImage}
                style={styles.removeButton}
              >
                <Text style={styles.buttonText}>Remove Image</Text>
              </Pressable>
              <Image source={{ uri: userImage }} style={styles.imagePreview} />
            </View>
          )}

          {signUpForm.userType === "Master Admin" && (
            <KeyboardAvoidingView>
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      style={styles.inputIcon}
                      name="school"
                      size={24}
                      color="gray"
                    />
                    <TextInput
                      value={signUpForm.universityName}
                      onChangeText={(text) =>
                        handleChange("universityName", text)
                      }
                      style={styles.input}
                      placeholder="Enter university name"
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      style={styles.inputIcon}
                      name="business"
                      size={24}
                      color="gray"
                    />
                    <TextInput
                      value={signUpForm.country}
                      onChangeText={(text) => handleChange("country", text)}
                      style={styles.input}
                      placeholder="Enter country"
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      style={styles.inputIcon}
                      name="location-city"
                      size={24}
                      color="gray"
                    />
                    <TextInput
                      value={signUpForm.location}
                      onChangeText={(text) => handleChange("location", text)}
                      style={styles.input}
                      placeholder="Enter location"
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      style={styles.inputIcon}
                      name="code"
                      size={24}
                      color="gray"
                    />
                    <TextInput
                      value={signUpForm.universityCode}
                      onChangeText={(text) =>
                        handleChange("universityCode", text)
                      }
                      style={styles.input}
                      placeholder="Enter university code"
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      style={styles.inputIcon}
                      name="local-post-office"
                      size={24}
                      color="gray"
                    />
                    <TextInput
                      value={signUpForm.postcode}
                      onChangeText={(text) => handleChange("postcode", text)}
                      style={styles.input}
                      placeholder="Enter postcode"
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      style={styles.inputIcon}
                      name="location-city"
                      size={24}
                      color="gray"
                    />
                    <TextInput
                      value={signUpForm.city}
                      onChangeText={(text) => handleChange("city", text)}
                      style={styles.input}
                      placeholder="Enter city"
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      style={styles.inputIcon}
                      name="location-on"
                      size={24}
                      color="gray"
                    />
                                       <TextInput
                      value={signUpForm.address}
                      onChangeText={(text) => handleChange("address", text)}
                      style={styles.input}
                      placeholder="Enter address"
                    />
                  </View>
                </View>
              </>
            </KeyboardAvoidingView>
          )}

          <View style={{ marginTop: 10 }} />
          <Pressable onPress={handleSignup} style={styles.registerButton}>
            <Text style={styles.buttonText}>
              {isSubmitting ? "Please wait" : "Register"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.goBackButton}
          >
            <Text style={styles.text}>
              Already have an account?{" "}
              <Text style={styles.signIn}>Sign In</Text>
            </Text>
          </Pressable>
          <View style={{ marginBottom: 10 }} />
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8", // Light gray background
    alignItems: "center",
  },
  text: {
    color: "#333", // Dark gray text
    fontSize: 14,
    paddingEnd: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    color: "#041E42",
  },
  logoContainer: {
    borderRadius: 75,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    alignItems: "center",
  },
  inputContainer: {
    marginTop: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#e0e0e0", // Light gray input background
    paddingVertical: 5,
    borderRadius: 5,
  },
  inputIcon: {
    marginLeft: 8,
  },
  input: {
    color: "#333", // Dark gray input text
    marginVertical: 10,
    width: 300,
    fontSize: 16,
  },
  label: {
    marginBottom: 5,
  },
  uploadButton: {
    backgroundColor: "#4a90e2", // Blue upload button
    borderRadius: 6,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: "#e74c3c", // Red remove button
    borderRadius: 6,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
  registerButton: {
    width: 200,
    backgroundColor: "#4a90e2", // Blue register button
    borderRadius: 6,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  goBackButton: {
    marginTop: 15,
  },
  buttonText: {
    color: "white", // White button text
    fontSize: 16,
    fontWeight: "bold",
  },
  additionalLinksContainer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  additionalLinksText: {
    paddingLeft: 5,
    color: "#007FFF", // Blue link text
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 20,
  },
  signIn: {
    color: "#4a90e2", // Blue sign in text
    fontSize: 14,
    marginBottom: 10,
  },
});

