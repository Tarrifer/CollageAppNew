import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Linking, Alert, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { db } from "../../lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";

const OnlineLibraryScreen = ({ navigation }) => {
  const [libraryLinks, setLibraryLinks] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  // Function to handle redirection to library URL
  const handleRedirect = (url) => {
    Linking.openURL(url).catch((error) => {
      console.error("Failed to open URL: ", error);
      Alert.alert("Error", "Failed to open the URL");
    });
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.heading}>Online Library</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007FFF" />
      ) : libraryLinks.length === 0 ? (
        <Text style={styles.noData}>No data found</Text>
      ) : (
        <>
          {libraryLinks.map((libraryLink, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleRedirect(libraryLink.url)}
            >
              <Text style={styles.cardText}>{libraryLink.name}</Text>
              <Text style={styles.cardText}>{libraryLink.url}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleRedirect(libraryLink.url)}
              >
                <Text style={styles.buttonText}>Go to Library</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  </ScrollView>
  
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
  card: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#007FFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  loader: {
    marginTop: 50,
  },
});

export default OnlineLibraryScreen;
