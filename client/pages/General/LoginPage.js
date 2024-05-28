import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoggedIn } from "../../context/actions/authActions";
import { isValidEmail } from "../../utils/validation";
import { loginSuccess, setUserType } from "../../context/actions/authActions";
import {
  StyleSheet,
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { forgotPassword, signIn } from "../../../lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [college, setCollege] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [localUserType, setLocalUserType] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const userType = useSelector((state) => state.auth.userType);
  const auth = getAuth();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }


  const handleLogin = async () => {
    // Validate input fields
    if (!email || !password || !localUserType || !college) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true); // Set loading state to true

    try {
      const user = await signIn(email, password, localUserType); // Call the signIn function

      if (user) {
        // Set isLoggedIn to true after successful sign-in
        dispatch(loginSuccess());
        dispatch(setUserType(localUserType));
        Alert.alert("Login Successful");
        navigation.navigate("MainDrawer");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  const isValidEmail = (email) => {
    // Basic email validation (can be enhanced further with regex)
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleForgotPassword = () => {
    forgotPassword(email)
      .then(() => {
        console.log("Password reset email sent.");
      })
      .catch((error) => {
        console.error("Error in sending password reset email: ", error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNK57Oj5ro7C-aFzfBHXuesubrY8lbH4Bxew&s.png",
            }}
          />
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Login In to your Account</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.pickerLabel}>User Type:</Text>
          <Picker
            selectedValue={localUserType}
            onValueChange={(itemValue, itemIndex) =>
              setLocalUserType(itemValue)
            }
            style={styles.pickerBox}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item
              style={{ color: "gray" }}
              label="Choose User Type"
              value=""
            />
            <Picker.Item label="Student" value="Student" />
            <Picker.Item label="Teacher" value="Teacher" />
            <Picker.Item label="Admin" value="Admin" />
            <Picker.Item label="Master Admin" value="Master Admin" />
          </Picker>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.pickerLabel}>College:</Text>
          <Picker
            selectedValue={college}
            onValueChange={(itemValue, itemIndex) => setCollege(itemValue)}
            style={styles.pickerBox}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item
              style={{ color: "gray" }}
              label="Choose College"
              value=""
            />
            <Picker.Item
              label="Royal Global University"
              value="Royal Global University"
            />
            <Picker.Item label="Amita University" value="Amita University" />
          </Picker>
        </View>
        <KeyboardAvoidingView>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                style={styles.inputIcon}
                name="email"
                size={24}
                color="gray"
              />
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
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
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                style={styles.input}
                placeholder="Enter your Password"
              />
            </View>
          </View>
          <View style={styles.footer}>
            <Text onPress={handleForgotPassword} style={styles.forgotPassword}>
              Forgot Password
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleLogin}
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={styles.signupButton}
            >
              <Text style={styles.signupButtonText}>
                Don't have an account?{" "}
                <Text style={{ color: "blue" }}>Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    marginTop: 50,
  },
  logoContainer: {
    borderRadius: 75,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
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
  inputContainer: {
    marginTop: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#e0e0e0",
    paddingVertical: 5,
    borderRadius: 5,
  },
  inputIcon: {
    marginLeft: 8,
  },
  input: {
    color: "gray",
    marginVertical: 10,
    width: 300,
    fontSize: 16,
  },
  label: {
    marginBottom: 5,
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: {
    marginLeft: 10,
  },
  forgotPassword: {
    color: "#007FFF",
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  button: {
    width: 200,
    backgroundColor: "#FEBE10",
    borderRadius: 6,
    padding: 15,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    marginTop: 15,
  },
  signupButtonText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
  pickerLabel: {
    color: "#041E42",
    fontSize: 16,
    marginBottom: 5,
  },
  pickerBox: {
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  pickerItem: {
    fontSize: 16,
    color: "gray",
  },
});
