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
import { FlatList } from "react-native";

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
              onPress={onView}
            >
              <Text
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
                style={styles.buttonText}
              >
                View
              </Text>
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
              onPress={onView}
            >
              <Text
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
                style={styles.buttonText}
              >
                View
              </Text>
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
  const [teachers, setTeachers] = useState([]);
  const [originalTeachers, setOriginalTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingTeachers = async () => {
    try {
      const teacherCollection = collection(db, "Teachers");
      const teacherDocs = await getDocs(teacherCollection);

      const fetchedTeachers = [];

      for (const teacherDoc of teacherDocs.docs) {
        const authCollection = collection(
          db,
          "Teachers",
          teacherDoc.id,
          "auth"
        );
        const q = query(authCollection, where("isApproved", "==", false));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTeachers.push({
            id: teacherDoc.id,
            authId: doc.id,
            ...data,
          });
        });
      }

      setTeachers(fetchedTeachers);
      setOriginalTeachers(fetchedTeachers); // Save the original list
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching pending teachers:", error);
      setLoading(false); // Set loading to false in case of error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingTeachers();
    setRefreshing(false);
  };

  const handleApprove = async (teacherId, authId) => {
    const authDocRef = doc(db, "Teachers", teacherId, "auth", authId);

    await updateDoc(authDocRef, { isApproved: true });
    Alert.alert("Approved successfully");

    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
    setOriginalTeachers(
      originalTeachers.filter((teacher) => teacher.id !== teacherId)
    ); // Update the original list
  };

  const handleView = (id) => {
    console.log(`View teacher with ID: ${id}`);
  };

  const handleReject = async (teacherId, authId) => {
    const authDocRef = doc(db, "Teachers", teacherId, "auth", authId);

    await updateDoc(authDocRef, { isApproved: false });
    Alert.alert("Rejected successfully");

    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
    setOriginalTeachers(
      originalTeachers.filter((teacher) => teacher.id !== teacherId)
    ); // Update the original list
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setTeachers(originalTeachers);
    } else {
      const filteredTeachers = originalTeachers.filter((teacher) => {
        const name = teacher.name ? teacher.name.toLowerCase() : "";
        const registerNumber = teacher.registerNumber
          ? teacher.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setTeachers(filteredTeachers);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <SearchUser onSearch={handleSearch} />
      {loading ? (
        <Text>Loading, please wait...</Text>
      ) : teachers.length > 0 ? (
        teachers.map((teacher) => (
          <ApprovalCard
            key={teacher?.id}
            name={teacher?.name}
            school={teacher?.schoolName}
            department={teacher?.department}
            registerNumber={teacher?.registerNumber}
            rollNumber={teacher?.rollNumber}
            phoneNumber={teacher?.phoneNumber}
            email={teacher?.email}
            imageUrl={teacher?.imageUrl}
            status={teacher?.isApproved === false ? "Pending" : "Approved"}
            onApprove={() => handleApprove(teacher.id, teacher.authId)}
            onView={() => handleView(teacher.id)}
            onReject={() => handleReject(teacher.id, teacher.authId)}
          />
        ))
      ) : (
        <Text>No results found</Text>
      )}
    </ScrollView>
  );
};

const AcceptedApproval = () => {
  const [teachers, setTeachers] = useState([]);
  const [originalTeachers, setOriginalTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAcceptedTeachers = async () => {
    try {
      const teacherCollection = collection(db, "Teachers");
      const teacherDocs = await getDocs(teacherCollection);

      const fetchedTeachers = [];

      for (const teacherDoc of teacherDocs.docs) {
        const authCollection = collection(
          db,
          "Teachers",
          teacherDoc.id,
          "auth"
        );
        const q = query(authCollection, where("isApproved", "==", true));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTeachers.push({
            id: teacherDoc.id,
            authId: doc.id,
            ...data,
          });
        });
      }

      setTeachers(fetchedTeachers);
      setOriginalTeachers(fetchedTeachers); // Save the original list
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching accepted teachers:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  useEffect(() => {
    fetchAcceptedTeachers();
  }, []);

  const handleDelete = async (teacherId, authId) => {
    const authDocRef = doc(db, "Teachers", teacherId, "auth", authId);

    await deleteDoc(authDocRef);
    Alert.alert("Deleted successfully");

    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
    setOriginalTeachers(
      originalTeachers.filter((teacher) => teacher.id !== teacherId)
    ); // Update the original list
  };

  const handleView = (id) => {
    console.log(`View teacher with ID: ${id}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAcceptedTeachers();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setTeachers(originalTeachers);
    } else {
      const filteredTeachers = originalTeachers.filter((teacher) => {
        const name = teacher.name ? teacher.name.toLowerCase() : "";
        const registerNumber = teacher.registerNumber
          ? teacher.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setTeachers(filteredTeachers);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <SearchUser onSearch={handleSearch} />
      {loading ? (
        <Text>Loading, please wait...</Text>
      ) : teachers.length > 0 ? (
        teachers.map((teacher) => (
          <ApprovalCard
            key={teacher?.id}
            name={teacher?.name}
            school={teacher?.schoolName}
            department={teacher?.department}
            registerNumber={teacher?.registerNumber}
            rollNumber={teacher?.rollNumber}
            phoneNumber={teacher?.phoneNumber}
            email={teacher?.email}
            imageUrl={teacher?.imageUrl}
            status={"Approved"}
            onView={() => handleView(teacher.id)}
            onDelete={() => handleDelete(teacher.id, teacher.authId)}
          />
        ))
      ) : (
        <Text>No results found</Text>
      )}
    </ScrollView>
  );
};

const RejectedApproval = () => {
  const [teachers, setTeachers] = useState([]);
  const [originalTeachers, setOriginalTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRejectedTeachers = async () => {
    try {
      const teacherCollection = collection(db, "Teachers");
      const teacherDocs = await getDocs(teacherCollection);

      const fetchedTeachers = [];

      for (const teacherDoc of teacherDocs.docs) {
        const authCollection = collection(
          db,
          "Teachers",
          teacherDoc.id,
          "auth"
        );
        const q = query(authCollection, where("isApproved", "==", false));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTeachers.push({
            id: teacherDoc.id,
            authId: doc.id,
            ...data,
          });
        });
      }

      setTeachers(fetchedTeachers);
      setOriginalTeachers(fetchedTeachers); // Save the original list
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching rejected teachers:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  useEffect(() => {
    fetchRejectedTeachers();
  }, []);

  const handleDelete = async (teacherId, authId) => {
    const authDocRef = doc(db, "Teachers", teacherId, "auth", authId);

    await deleteDoc(authDocRef);
    Alert.alert("Deleted successfully");

    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
    setOriginalTeachers(
      originalTeachers.filter((teacher) => teacher.id !== teacherId)
    ); // Update the original list
  };

  const handleView = (id) => {
    console.log(`View teacher with ID: ${id}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRejectedTeachers();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setTeachers(originalTeachers);
    } else {
      const filteredTeachers = originalTeachers.filter((teacher) => {
        const name = teacher.name ? teacher.name.toLowerCase() : "";
        const registerNumber = teacher.registerNumber
          ? teacher.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setTeachers(filteredTeachers);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <SearchUser onSearch={handleSearch} />
      {loading ? (
        <Text>Loading, please wait...</Text>
      ) : teachers.length > 0 ? (
        teachers.map((teacher) => (
          <ApprovalCard
            key={teacher?.id}
            name={teacher?.name}
            school={teacher?.schoolName}
            department={teacher?.department}
            registerNumber={teacher?.registerNumber}
            rollNumber={teacher?.rollNumber}
            phoneNumber={teacher?.phoneNumber}
            email={teacher?.email}
            imageUrl={teacher?.imageUrl}
            status={"Rejected"}
            onView={() => handleView(teacher.id)}
            onDelete={() => handleDelete(teacher.id, teacher.authId)}
          />
        ))
      ) : (
        <Text>No results found</Text>
      )}
    </ScrollView>
  );
};

const TeacherApprovalScreen = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Pending" component={PendingApproval} />
      <Tab.Screen name="Accepted" component={AcceptedApproval} />
      <Tab.Screen name="Rejected" component={RejectedApproval} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 8,
  },
  cardStatus: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default TeacherApprovalScreen;
