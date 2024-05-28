import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import SearchUser from "../../components/SearchUser";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Adjust the import path as needed

const Tab = createMaterialTopTabNavigator();

const ApprovalCard = ({
  name,
  school,
  department,
  registerNumber,
  phoneNumber,
  email,
  rollNumber,
  imageUrl,
  status,
  onApprove,
  onView,
  onReject,
  onDelete,
  userType,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#007FFF"; // Blue color for pending status
      case "Approved":
        return "green"; // Green color for approved status
      case "Rejected":
        return "red"; // Red color for rejected status
      default:
        return "#000"; // Default black color
    }
  };
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardText}>Name: {name}</Text>
      {school && <Text style={styles.cardText}>School: {school}</Text>}
      {department && (
        <Text style={styles.cardText}>Department: {department}</Text>
      )}
      {department && <Text style={styles.cardText}>User-Type: {userType}</Text>}
      <Text
        style={[
          styles.cardStatus,
          { color: getStatusColor(status) }, // Set text color based on status
        ]}
      >
        Status: {status}
      </Text>
      <View style={styles.buttonContainer}>
        {status === "Pending" && (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "green" }]}
              onPress={() => {
                Alert.alert(
                  "Confirm Approval",
                  "Are you sure you want to approve?",
                  [
                    {
                      text: "No",
                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: onApprove,
                    },
                  ]
                );
              }}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#6490E8" }]}
              onPress={() => {
                onView();
                navigation.navigate("CandidateDetailsViewScreen", {
                  name,
                  school,
                  department,
                  registerNumber,
                  phoneNumber,
                  email,
                  rollNumber,
                  imageUrl,
                  status,
                });
              }}
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red" }]}
              onPress={() => {
                Alert.alert(
                  "Confirm Rejection",
                  "Are you sure you want to reject?",
                  [
                    {
                      text: "No",
                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: onReject,
                    },
                  ]
                );
              }}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
        {(status === "Approved" || status === "Rejected") && (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#6490E8" }]}
              onPress={() => {
                onView();
                navigation.navigate("CandidateDetailsViewScreen", {
                  name,
                  school,
                  department,
                  registerNumber,
                  phoneNumber,
                  email,
                  rollNumber,
                  imageUrl,
                  status,
                });
              }}
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red" }]}
              onPress={onDelete}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const PendingApproval = () => {
  const [admins, setAdmins] = useState([]);
  const [originalAdmins, setOriginalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingAdmins = async () => {
    try {
      const userTypes = ["Admins", "Students", "Teachers"];
      const fetchedUsers = [];
  
      for (const userType of userTypes) {
        const userCollection = collection(db, userType);
        const userDocs = await getDocs(userCollection);
  
        for (const userDoc of userDocs.docs) {
          const authCollection = collection(db, userType, userDoc.id, "auth");
          const q = query(authCollection, where("isApproved", "==", false), where("isRejected", "!=", true));
          const querySnapshot = await getDocs(q);
  
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedUsers.push({
              id: userDoc.id,
              authId: doc.id,
              userType, // Add the user type to the data
              ...data,
            });
          });
        }
      }
  
      setAdmins(fetchedUsers);
      setOriginalAdmins(fetchedUsers); // Save the original list
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching pending users:", error);
      setLoading(false); // Set loading to false in case of error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchPendingAdmins();
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (userType, userId, authId) => {
    const authDocRef = doc(db, `${userType}s`, userId, "auth", authId);

    await updateDoc(authDocRef, { isApproved: true });
    Alert.alert("Approved successfully");

    setAdmins(admins.filter((admin) => admin.id !== userId));
    setOriginalAdmins(originalAdmins.filter((admin) => admin.id !== userId)); // Update the original list
  };

  const handleView = (id) => {
    console.log(`View admin with ID: ${id}`);
  };

  const handleReject = async (userType, userId, authId) => {
    const authDocRef = doc(db, `${userType}s`, userId, "auth", authId);
  
    await updateDoc(authDocRef, { isApproved: false, isRejected: true });
    Alert.alert("Rejected successfully");
  
    setAdmins(admins.filter((admin) => admin.id !== userId));
    setOriginalAdmins(originalAdmins.filter((admin) => admin.id !== userId)); // Update the original list
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setAdmins(originalAdmins);
    } else {
      const filteredAdmins = originalAdmins.filter((admin) => {
        const name = admin.name ? admin.name.toLowerCase() : "";
        const registerNumber = admin.registerNumber
          ? admin.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setAdmins(filteredAdmins);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <SearchUser onSearch={handleSearch} />
      {loading ? (
        <Text>Loading, please wait...</Text>
      ) : admins.length > 0 ? (
        admins.map((admin) => (
          <ApprovalCard
            key={admin?.id}
            name={admin?.name}
            school={admin?.schoolName}
            department={admin?.department}
            registerNumber={admin?.registerNumber}
            rollNumber={admin?.rollNumber}
            phoneNumber={admin?.phoneNumber}
            userType={admin?.userType}
            email={admin?.email}
            imageUrl={admin?.imageUrl}
            status={admin?.isApproved === false ? "Pending" : "Approved"}
            onApprove={() =>
              handleApprove(admin.userType, admin.id, admin.authId)
            }
            onView={() => handleView(admin.id)}
            onReject={() =>
              handleReject(admin.userType, admin.id, admin.authId)
            }
          />
        ))
      ) : (
        <Text>No results found</Text>
      )}
    </ScrollView>
  );
};

const AcceptedApproval = () => {
  const [admins, setAdmins] = useState([]);
  const [originalAdmins, setOriginalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAcceptedAdmins = async () => {
    try {
      const userTypes = ["Admins", "Students", "Teachers"];
      const fetchedUsers = [];

      for (const userType of userTypes) {
        const userCollection = collection(db, userType);
        const userDocs = await getDocs(userCollection);

        for (const userDoc of userDocs.docs) {
          const authCollection = collection(db, userType, userDoc.id, "auth");
          const q = query(authCollection, where("isApproved", "==", true));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedUsers.push({
              id: userDoc.id,
              authId: doc.id,
              userType, // Add the user type to the data
              ...data,
            });
          });
        }
      }

      setAdmins(fetchedUsers);
      setOriginalAdmins(fetchedUsers); // Save the original list
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching accepted users:", error);
      setLoading(false); // Set loading to false in case of error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedAdmins();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAcceptedAdmins();
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleView = (id) => {
    console.log(`View admin with ID: ${id}`);
  };

  const handleDelete = async (id) => {
    const adminDocRef = doc(db, "Admins", id);
    await deleteDoc(adminDocRef);
    Alert.alert("Admin deleted successfully");
    setAdmins(admins.filter((admin) => admin.id !== id));
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setAdmins(originalAdmins);
    } else {
      const filteredAdmins = originalAdmins.filter((admin) => {
        const name = admin.name ? admin.name.toLowerCase() : "";
        const registerNumber = admin.registerNumber
          ? admin.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setAdmins(filteredAdmins);
    }
  };

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={admins}
      renderItem={({ item }) => (
        <ScrollView>
          <ApprovalCard
            key={item?.id}
            name={item?.name}
            school={item?.schoolName}
            department={item?.department}
            registerNumber={item?.registerNumber}
            rollNumber={item?.rollNumber}
            phoneNumber={item?.phoneNumber}
            userType={item?.userType}
            email={item?.email}
            imageUrl={item?.imageUrl}
            status={item?.isApproved === false ? "Pending" : "Approved"}
            onView={() => handleView(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        </ScrollView>
      )}
      keyExtractor={(item) => item?.id}
      ListHeaderComponent={() => <SearchUser onSearch={handleSearch} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={<Text>No results found</Text>}
    />
  );
};

const RejectedApproval = () => {
  const [admins, setAdmins] = useState([]);
  const [originalAdmins, setOriginalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRejectedAdmins = async () => {
    try {
      const userTypes = ["Admins", "Students", "Teachers"];
      const fetchedUsers = [];

      for (const userType of userTypes) {
        const userCollection = collection(db, userType);
        const userDocs = await getDocs(userCollection);

        for (const userDoc of userDocs.docs) {
          const authCollection = collection(db, userType, userDoc.id, "auth");
          const q = query(authCollection, where("isApproved", "==", false));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedUsers.push({
              id: userDoc.id,
              authId: doc.id,
              userType, // Add the user type to the data
              ...data,
            });
          });
        }
      }

      setAdmins(fetchedUsers);
      setOriginalAdmins(fetchedUsers); // Save the original list
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching rejected users:", error);
      setLoading(false); // Set loading to false in case of error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedAdmins();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchRejectedAdmins();
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (userType, userId, authId) => {
    const authDocRef = doc(db, `${userType}s`, userId, "auth", authId);

    await updateDoc(authDocRef, { isApproved: true });
    Alert.alert("Approved successfully");

    setAdmins(admins.filter((admin) => admin.id !== userId));
    setOriginalAdmins(originalAdmins.filter((admin) => admin.id !== userId)); // Update the original list
  };

  const handleView = (id) => {
    console.log(`View admin with ID: ${id}`);
  };

  const handleDelete = async (id) => {
    const adminDocRef = doc(db, "Admins", id);
    await deleteDoc(adminDocRef);
    Alert.alert("Admin deleted successfully");
    setAdmins(admins.filter((admin) => admin.id !== id));
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setAdmins(originalAdmins);
    } else {
      const filteredAdmins = originalAdmins.filter((admin) => {
        const name = admin.name ? admin.name.toLowerCase() : "";
        const registerNumber = admin.registerNumber
          ? admin.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setAdmins(filteredAdmins);
    }
  };

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={admins}
      renderItem={({ item }) => (
        <ScrollView>
          <ApprovalCard
            key={item?.id}
            name={item?.name}
            school={item?.schoolName}
            department={item?.department}
            registerNumber={item?.registerNumber}
            rollNumber={item?.rollNumber}
            phoneNumber={item?.phoneNumber}
            userType={item?.userType}
            email={item?.email}
            imageUrl={item?.imageUrl}
            status={item?.isApproved === false ? "Pending" : "Approved"}
            onApprove={() => handleApprove(item.userType, item.id, item.authId)}
            onView={() => handleView(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        </ScrollView>
      )}
      ListHeaderComponent={() => <SearchUser onSearch={handleSearch} />}
      keyExtractor={(item) => item?.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={<Text>No results found</Text>}
    />
  );
};

const RegistrationApprovalTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Pending" component={PendingApproval} />
      <Tab.Screen name="Accepted" component={AcceptedApproval} />
      <Tab.Screen name="Rejected" component={RejectedApproval} />
    </Tab.Navigator>
  );
};

const MAdminRegistrationApproval = () => {
  return <RegistrationApprovalTabs />;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardStatus: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    margin: 5,
    Horizontal: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default MAdminRegistrationApproval;
