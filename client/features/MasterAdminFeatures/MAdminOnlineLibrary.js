import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../lib/firebase"; // Adjust the import path as needed
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
} from "firebase/firestore";

const MAdminOnlineLibrary = () => {
  const [libraryLinks, setLibraryLinks] = useState([]);
  const [libraryName, setLibraryName] = useState("");
  const [libraryLink, setLibraryLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLibraryLinks();
  }, []);

  const fetchLibraryLinks = async () => {
    try {
      const masterAdminCollection = collection(db, "Master Admins");
      const masterAdminDocs = await getDocs(masterAdminCollection);
      const fetchedLinks = [];

      for (const adminDoc of masterAdminDocs.docs) {
        const linksCollection = collection(
          db,
          "Master Admins",
          adminDoc.id,
          "libraryLinks"
        );
        const linksQuery = query(linksCollection);
        const querySnapshot = await getDocs(linksQuery);
        querySnapshot.forEach((linkDoc) => {
          fetchedLinks.push({
            id: linkDoc.id,
            adminId: adminDoc.id,
            ...linkDoc.data(),
          });
        });
      }
      setLibraryLinks(fetchedLinks);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch library links");
      console.error("Error fetching library links: ", error);
    }
  };

  const handleAddLibraryLink = async () => {
    if (
      libraryName.trim() !== "" &&
      libraryLink.trim() !== "" &&
      isValidURL(libraryLink)
    ) {
      try {
        const userDocRef = await addDoc(collection(db, "Master Admins"), {});
        const linkDocRef = await addDoc(
          collection(db, "Master Admins", userDocRef.id, "libraryLinks"),
          { name: libraryName, url: libraryLink }
        );
        setLibraryLinks([
          ...libraryLinks,
          {
            id: linkDocRef.id,
            adminId: userDocRef.id,
            name: libraryName,
            url: libraryLink,
          },
        ]);
        setLibraryName("");
        setLibraryLink("");
        setError("");
        Alert.alert("Success", "Library link added successfully");
      } catch (error) {
        setError("Failed to add library link.");
        console.error("Error adding library link: ", error);
      }
    } else {
      setError("Please enter a valid name and URL.");
    }
  };

  const handleDeleteLibraryLink = async (index) => {
    const linkToDelete = libraryLinks[index];
    try {
      await deleteDoc(
        doc(
          db,
          "Master Admins",
          linkToDelete.adminId,
          "libraryLinks",
          linkToDelete.id
        )
      );
      const updatedLibraryLinks = [...libraryLinks];
      updatedLibraryLinks.splice(index, 1);
      setLibraryLinks(updatedLibraryLinks);
      Alert.alert("Success", "Library link deleted successfully");
    } catch (error) {
      setError("Failed to delete library link.");
      console.error("Error deleting library link: ", error);
    }
  };

  const handleRedirect = async (url) => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Online Library</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Library Name"
          onChangeText={(value) => setLibraryName(value)}
          value={libraryName}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Library Link"
          onChangeText={(value) => setLibraryLink(value)}
          value={libraryLink}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity onPress={handleAddLibraryLink} style={styles.button}>
          <Text style={styles.buttonText}>Add Library Link</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="#007FFF" />
        ) : (
          libraryLinks.map((libraryLink, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardText}>{libraryLink.name}</Text>
              <Text style={styles.cardText}>{libraryLink.url}</Text>
              <View style={styles.cardButtons}>
                <TouchableOpacity
                  onPress={() => handleRedirect(libraryLink.url)}
                  style={[styles.cardButton, styles.goButton]}
                >
                  <Text style={styles.cardButtonText}>Go</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteLibraryLink(index)}
                  style={[styles.cardButton, styles.deleteButton]}
                >
                  <Text style={styles.cardButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#007FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cardButton: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  goButton: {
    backgroundColor: "#007FFF",
  },
  deleteButton: {
    backgroundColor: "red",
  },
  cardButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MAdminOnlineLibrary;
