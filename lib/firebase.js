import { getStorage } from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  initializeAuth,
  getReactNativePersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";
const firebaseConfig = {
  apiKey: "AIzaSyC-7A53EDXJfGpMx4f8NP0E0R8tSWJvseI",
  authDomain: "college-app-c8b13.firebaseapp.com",
  databaseURL: "https://college-app-c8b13-default-rtdb.firebaseio.com",
  projectId: "college-app-c8b13",
  storageBucket: "college-app-c8b13.appspot.com",
  messagingSenderId: "115323592126",
  appId: "1:115323592126:web:1b7a0f0e4843ca98c22def",
  measurementId: "G-BQ28PWG5Q5",
};

let auth;
// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (!getAuth(app)) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  auth = getAuth(app);
}
const db = getFirestore(app);
export const storage = getStorage(app);

const signUp = async (
  email,
  password,
  name,
  schoolName,
  department,
  registerNumber,
  rollNumber,
  phoneNumber,
  userType,
  imageUrl,
  universityName,
  country,
  location,
  universityCode,
  postcode,
  city,
  address
) => {
  console.log(
    email,
    password,
    name,
    schoolName,
    department,
    registerNumber,
    rollNumber,
    phoneNumber,
    userType,
    imageUrl,
    universityName,
    country,
    "country",
    location,
    universityCode,
    postcode,
    city,
    address
  );
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await sendEmailVerification(user);
    Alert.alert(
      "Email Verification Sent",
      "A verification email has been sent to your registered email address. Please verify your email to complete the sign-up process."
    );

    const commonData = {
      email,
      uid: user.uid, // Store the UID here
      name,
      schoolName,
      department,
      registerNumber,
      rollNumber,
      phoneNumber,
      userType,
      imageUrl,
      createdAt: serverTimestamp(),
      isApproved: userType === "Master Admin" ? true : false,
      isRejected: false
    };

    let userData = {};

    switch (userType) {
      case "Student":
      case "Teacher":
      case "Admin":
        userData = commonData;
        break;
      case "Master Admin":
        userData = {
          ...commonData,
          universityName,
          country,
          location,
          universityCode,
          postcode,
          city,
          address,
        };
        break;
      default:
        throw new Error("Invalid user type");
    }

    // Add a document to the main collection (e.g., Teachers)
    const userDocRef = await addDoc(collection(db, `${userType}s`), {});

    // Add the user data to the "auth" subcollection
    await addDoc(
      collection(db, `${userType}s`, userDocRef.id, "auth"),
      userData
    );

    console.log(userDocRef);
    return user;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

const signIn = async (email, password, localUserType) => {
  console.log(localUserType);
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      Alert.alert(
        "Email not verified",
        "Please verify your email before signing in."
      );
      return null;
    }

    // Check if the user is approved for Student or Teacher
    // if (
      // localUserType === "Student" 
     /* localUserType === "Teacher" ||
      localUserType === "Admin"*/
     {
      const userCollection = collection(db, `${localUserType}s`);
      const userDocs = await getDocs(userCollection);

      let isApproved = false;
      let userDataFound = false;

      for (const userDoc of userDocs.docs) {
        const authCollectionRef = collection(
          db,
          `${localUserType}s`,
          userDoc.id,
          "auth"
        );
        const authDocQuery = query(
          authCollectionRef,
          where("uid", "==", user.uid)
        );
        const authDocSnapshot = await getDocs(authDocQuery);

        if (!authDocSnapshot.empty) {
          userDataFound = true;
          authDocSnapshot.forEach((authDoc) => {
            const userData = authDoc.data();
            if (userData.isApproved) {
              isApproved = true;
            }
          });
          break;
        }
      }

      if (!userDataFound) {
        Alert.alert(
          "User Data Not Found",
          "Unable to find your user data. Please contact support."
        );
        return null;
      }

      if (!isApproved) {
        Alert.alert(
          "Approval Pending",
          "Your account is pending approval from the master admin. Please wait for approval."
        );
        return null;
      }
    }

    // Allow login for Admin and Master Admin without approval check
    return user;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

const logOut = async () => {
  try {
    await signOut();
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    Alert.alert(
      "Password Reset Email Sent",
      "A password reset email has been sent to your registered email address. Please check your email."
    );
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};


const createCourseEntries = async (data) => {
  try {
    await addDoc(collection(db, "courses"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

// Fetch courses data from Firestore

export { signUp, signIn, signOut, createCourseEntries, db, logOut, forgotPassword };
export default app;
