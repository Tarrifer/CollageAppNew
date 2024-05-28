import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { getAuth } from "firebase/auth";
import { db } from "../../lib/firebase";
import { addDoc, collection } from "firebase/firestore";

const FeedbackScreen = () => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingText, setRatingText] = useState(""); // New state for rating text
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const userType = useSelector((state) => state.auth.userType);

  const handleStarPress = (starCount) => {
    setRating(starCount);
    switch (starCount) {
      case 1:
        setRatingText("Very Bad");
        break;
      case 2:
        setRatingText("Bad");
        break;
      case 3:
        setRatingText("OK");
        break;
      case 4:
        setRatingText("Good");
        break;
      case 5:
        setRatingText("Excellent");
        break;
      default:
        setRatingText("");
    }
  };

  const handleSubmit = async () => {
    if (!feedback || !rating) {
      setErrorModalVisible(true);
      return;
    }
  
    const auth = getAuth();
    const currentUser = auth.currentUser;
  
    if (!currentUser) {
      console.log("No user is currently logged in");
      return;
    }
  
    try {
      const feedbackData = {
        feedback: feedback,
        rating: rating,
        ratingText: ratingText,
        userName: currentUser.displayName || "Anonymous User", // Use the user's display name or a default value
        userCode: currentUser.uid, // Use the user's UID as the user code
        userType: userType, // Include the user type
        dateTime: new Date().toLocaleString(),
      };
  
      const feedbackCollectionRef = collection(db, "feedback");
      await addDoc(feedbackCollectionRef, feedbackData);
  
      console.log("Feedback submitted successfully!");

      setModalVisible(true);
      setFeedback("");
      setRating(0);
      setRatingText("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Feedback</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Enter your feedback"
        value={feedback}
        onChangeText={(text) => setFeedback(text)}
      />
      <View style={styles.ratingTextContainer}>
        <Text style={styles.ratingText}>{ratingText}</Text>
      </View>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((starCount) => (
          <TouchableOpacity
            key={starCount}
            onPress={() => handleStarPress(starCount)}
          >
            <AntDesign
              name={rating >= starCount ? "star" : "staro"}
              size={40}
              color="#FFD700"
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Submit Feedback" onPress={handleSubmit} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Feedback Submitted Successfully!
            </Text>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => {
          setErrorModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Please fill out all inputs before submitting.
            </Text>
            <Button title="Close" onPress={() => setErrorModalVisible(false)} />
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
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  ratingTextContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 5,
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
});

export default FeedbackScreen;
