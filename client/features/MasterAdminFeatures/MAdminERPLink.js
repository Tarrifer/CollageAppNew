import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
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

const MAdminERPLink = () => {
  const [erpLinks, setERPLinks] = useState([]);
  const [erpName, setERPName] = useState("");
  const [erpURL, setERPURL] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchERPLinks();
  }, []);

  const fetchERPLinks = async () => {
    setLoading(true);
    try {
      const masterAdminCollection = collection(db, "Master Admins");
      const masterAdminDocs = await getDocs(masterAdminCollection);
      const fetchedLinks = [];

      for (const adminDoc of masterAdminDocs.docs) {
        const linksCollection = collection(
          db,
          "Master Admins",
          adminDoc.id,
          "erpLinks"
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
      setERPLinks(fetchedLinks);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch ERP links");
      console.error("Error fetching ERP links: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddERPLink = async () => {
    if (erpName.trim() !== "" && erpURL.trim() !== "" && isValidURL(erpURL)) {
      setLoading(true);
      try {
        const userDocRef = await addDoc(collection(db, "Master Admins"), {});
        const linkDocRef = await addDoc(
          collection(db, "Master Admins", userDocRef.id, "erpLinks"),
          { name: erpName, url: erpURL }
        );
        setERPLinks([
          ...erpLinks,
          {
            id: linkDocRef.id,
            adminId: userDocRef.id,
            name: erpName,
            url: erpURL,
          },
        ]);
        setERPName("");
        setERPURL("");
        setError("");
        Alert.alert("Success", "ERP link added successfully");
      } catch (error) {
        setError("Failed to add ERP link.");
        console.error("Error adding ERP link: ", error);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please enter a valid name and URL.");
    }
  };

  const handleDeleteERPLink = async (index) => {
    const linkToDelete = erpLinks[index];
    setLoading(true);
    try {
      await deleteDoc(
        doc(
          db,
          "Master Admins",
          linkToDelete.adminId,
          "erpLinks",
          linkToDelete.id
        )
      );
      const updatedERPLinks = [...erpLinks];
      updatedERPLinks.splice(index, 1);
      setERPLinks(updatedERPLinks);
      Alert.alert("Success", "ERP link deleted successfully");
    } catch (error) {
      setError("Failed to delete ERP link.");
      console.error("Error deleting ERP link: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = (url) => {
    Linking.openURL(url);
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
        <Text style={styles.heading}>ERP Links</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter ERP Name"
          onChangeText={(value) => setERPName(value)}
          value={erpName}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter ERP Link"
          onChangeText={(value) => setERPURL(value)}
          value={erpURL}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity onPress={handleAddERPLink} style={styles.button}>
          <Text style={styles.buttonText}>Add ERP Link</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="#007FFF" />
        ) : (
          erpLinks.map((erpLink, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardText}>{erpLink.name}</Text>
              <Text style={styles.cardText}>{erpLink.url}</Text>
              <View style={styles.cardButtons}>
                <TouchableOpacity
                  onPress={() => handleRedirect(erpLink.url)}
                  style={[styles.cardButton, styles.goButton]}
                >
                  <Text style={styles.cardButtonText}>Go</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteERPLink(index)}
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

export default MAdminERPLink;
