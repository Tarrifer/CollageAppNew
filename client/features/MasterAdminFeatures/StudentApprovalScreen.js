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
  const [students, setStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingStudents = async () => {
      try {
        const studentCollection = collection(db, "Students");
        const studentDocs = await getDocs(studentCollection);

        const fetchedStudents = [];

        for (const studentDoc of studentDocs.docs) {
          const authCollection = collection(
            db,
            "Students",
            studentDoc.id,
            "auth"
          );
          const q = query(authCollection, where("isApproved", "==", false));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedStudents.push({
              id: studentDoc.id,
              authId: doc.id,
              ...data,
            });
          });
        }

        setStudents(fetchedStudents);
        setOriginalStudents(fetchedStudents); // Save the original list
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching pending students:", error);
        setLoading(false); // Set loading to false in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchPendingStudents();
  }, []);

  const handleApprove = async (studentId, authId) => {
    const authDocRef = doc(db, "Students", studentId, "auth", authId);

    await updateDoc(authDocRef, { isApproved: true });
    Alert.alert("Approved successfully");

    setStudents(students.filter((student) => student.id !== studentId));
    setOriginalStudents(
      originalStudents.filter((student) => student.id !== studentId)
    ); // Update the original list
  };

  const handleView = (id) => {
    console.log(`View student with ID: ${id}`);
  };

  const handleReject = async (studentId, authId) => {
    const authDocRef = doc(db, "Students", studentId, "auth", authId);

    await updateDoc(authDocRef, { isApproved: false });
    Alert.alert("Rejected successfully");

    setStudents(students.filter((student) => student.id !== studentId));
    setOriginalStudents(
      originalStudents.filter((student) => student.id !== studentId)
    ); // Update the original list
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setStudents(originalStudents);
    } else {
      const filteredStudents = originalStudents.filter((student) => {
        const name = student.name ? student.name.toLowerCase() : "";
        const registerNumber = student.registerNumber
          ? student.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setStudents(filteredStudents);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SearchUser onSearch={handleSearch} />
      {loading ? (
        <Text>Loading, please wait...</Text>
      ) : students.length > 0 ? (
        students.map((student) => (
          <ApprovalCard
            key={student?.id}
            name={student?.name}
            school={student?.schoolName}
            department={student?.department}
            registerNumber={student?.registerNumber}
            rollNumber={student?.rollNumber}
            phoneNumber={student?.phoneNumber}
            email={student?.email}
            imageUrl={student?.imageUrl}
            status={student?.isApproved === false ? "Pending" : "Approved"}
            onApprove={() => handleApprove(student.id, student.authId)}
            onView={() => handleView(student.id)}
            onReject={() => handleReject(student.id, student.authId)}
          />
        ))
      ) : (
        <Text>No results found</Text>
      )}
    </ScrollView>
  );
};

const AcceptedApproval = () => {
  const [students, setStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAcceptedStudents = async () => {
    try {
      const studentCollection = collection(db, "Students");
      const studentDocs = await getDocs(studentCollection);

      const fetchedStudents = [];

      for (const studentDoc of studentDocs.docs) {
        const authCollection = collection(
          db,
          "Students",
          studentDoc.id,
          "auth"
        );
        const q = query(authCollection, where("isApproved", "==", true));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedStudents.push({
            id: studentDoc.id,
            authId: doc.id,
            ...data,
          });
        });
      }

      setStudents(fetchedStudents);
      setOriginalStudents(fetchedStudents); // Save the original list
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching pending students:", error);
      setLoading(false); // Set loading to false in case of error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAcceptedStudents();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAcceptedStudents();
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleView = (id) => {
    console.log(`View student with ID: ${id}`);
  };

  const handleDelete = async (id) => {
    const studentDocRef = doc(db, "Students", id);
    await deleteDoc(studentDocRef);
    Alert.alert("Student deleted successfully");
    setStudents(students.filter((student) => student.id !== id));
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setStudents(originalStudents);
    } else {
      const filteredStudents = originalStudents.filter((student) => {
        const name = student.name ? student.name.toLowerCase() : "";
        const registerNumber = student.registerNumber
          ? student.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setStudents(filteredStudents);
    }
  };

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={students}
      renderItem={({ item }) => (
        <ScrollView>
          <SearchUser onSearch={handleSearch} />
          <ApprovalCard
            key={item?.id}
            name={item?.name}
            school={item?.schoolName}
            department={item?.department}
            registerNumber={item?.registerNumber}
            rollNumber={item?.rollNumber}
            phoneNumber={item?.phoneNumber}
            email={item?.email}
            imageUrl={item?.imageUrl}
            status={item?.isApproved === false ? "Pending" : "Approved"}
            onView={() => handleView(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        </ScrollView>
      )}
      keyExtractor={(item) => item?.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={<Text>No results found</Text>}
    />
  );
};

const RejectedApproval = () => {
  const [students, setStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRejectedtudents = async () => {
    try {
      const studentCollection = collection(db, "Students");
      const studentDocs = await getDocs(studentCollection);

      const fetchedStudents = [];

      for (const studentDoc of studentDocs.docs) {
        const authCollection = collection(
          db,
          "Students",
          studentDoc.id,
          "auth"
        );
        const q = query(authCollection, where("isApproved", "==", false));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedStudents.push({
            id: studentDoc.id,
            authId: doc.id,
            ...data,
          });
        });
      }

      setStudents(fetchedStudents);
      setOriginalStudents(fetchedStudents); // Save the original list
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching pending students:", error);
      setLoading(false); // Set loading to false in case of error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRejectedtudents();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchAcceptedStudents();
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleView = (id) => {
    console.log(`View student with ID: ${id}`);
  };

  const handleDelete = async (id) => {
    const studentDocRef = doc(db, "Students", id);
    await deleteDoc(studentDocRef);
    Alert.alert("Student deleted successfully");
    setStudents(students.filter((student) => student.id !== id));
  };

  const handleSearch = (query) => {
    if (query.trim() === "") {
      setStudents(originalStudents);
    } else {
      const filteredStudents = originalStudents.filter((student) => {
        const name = student.name ? student.name.toLowerCase() : "";
        const registerNumber = student.registerNumber
          ? student.registerNumber.toLowerCase()
          : "";
        return (
          name.includes(query.toLowerCase()) ||
          registerNumber.includes(query.toLowerCase())
        );
      });
      setStudents(filteredStudents);
    }
  };

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={students}
      renderItem={({ item }) => (
        <ScrollView contentContainerStyle={styles.container}>
          <SearchUser onSearch={handleSearch} />
          <ApprovalCard
            key={item?.id}
            name={item?.name}
            school={item?.schoolName}
            department={item?.department}
            registerNumber={item?.registerNumber}
            rollNumber={item?.rollNumber}
            phoneNumber={item?.phoneNumber}
            email={item?.email}
            imageUrl={item?.imageUrl}
            status={item?.isApproved === false ? "Pending" : "Approved"}
            onView={() => handleView(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        </ScrollView>
      )}
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

const StudentApprovalScreen = () => {
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
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default StudentApprovalScreen;
