import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const StudentERPScreen = () => {
  const [erpLinks, setERPLinks] = useState([]);
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

  // Function to handle redirection to ERP URL
  const handleRedirect = (url) => {
    Linking.openURL(url).catch((error) => {
      console.error("Failed to open URL: ", error);
      Alert.alert("Error", "Failed to open the URL");
    });
  };
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.heading}>Student ERP</Text>
        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#007FFF"
          />
        ) : erpLinks.length === 0 ? (
          <Text style={styles.noData}>No data found</Text>
        ) : (
          <>
            {erpLinks.map((erpLink, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => handleRedirect(erpLink.url)}
              >
                <Text style={styles.cardText}>{erpLink.name}</Text>
                <Text style={styles.cardText}>{erpLink.url}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleRedirect(erpLink.url)}
                >
                  <Text style={styles.buttonText}>Go to ERP</Text>
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

export default StudentERPScreen;
