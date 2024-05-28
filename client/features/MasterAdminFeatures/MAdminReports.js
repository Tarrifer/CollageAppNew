import React, { useState, useEffect } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Adjust the import path as needed
import { getAuth } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createMaterialTopTabNavigator();

const ReportCard = ({ title, type,adminName }) => {
  return (
    <View style={styles.reportCard}>
      <Text style={styles.reportTitle}>Description: {title}</Text>
      <Text style={styles.reportTitle}>Report Type: {type}</Text>
      <Text style={styles.reportTitle}>Sender Name: {adminName}</Text>
    </View>
  );
};

const ReportList = ({ reports, loading }) => {
  if (loading) {
    return <ActivityIndicator size="large" color="#007FFF" />;
  }

  if (reports.length === 0) {
    return <Text>No reports found</Text>;
  }

  return reports.map((report, index) => (
    <ReportCard key={index} title={report.description} type={report.reportType} adminName={report.adminName} />
  ));
};

const fetchReportsFromSubcollections = async (userCollection) => {
  const reports = [];
  try {
    const mainCollectionSnapshot = await getDocs(collection(db, userCollection));
    for (const doc of mainCollectionSnapshot.docs) {
      const subcollectionSnapshot = await getDocs(collection(db, userCollection, doc.id, "reports"));
      for (const subDoc of subcollectionSnapshot.docs) {
        reports.push({
          id: subDoc.id,
          userId: doc.id,
          ...subDoc.data(),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
  }
  return reports;
};

const StudentReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const fetchedReports = await fetchReportsFromSubcollections("Students");
        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching student reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ReportList reports={reports} loading={loading} />
    </ScrollView>
  );
};

const TeacherReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(reports,"reports")

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    console.log(user);
  },[])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const fetchedReports = await fetchReportsFromSubcollections("Teachers");
        setReports(fetchedReports);
        console.log(fetchedReports);
      } catch (error) {
        console.error("Error fetching teacher reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ReportList reports={reports} loading={loading} />
    </ScrollView>
  );
};

const AdminReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const fetchedReports = await fetchReportsFromSubcollections("Admins");
        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching admin reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ReportList reports={reports} loading={loading} />
    </ScrollView>
  );
};

const MAdminReports = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
            tabBarIndicatorStyle: { backgroundColor: "white" },
            tabBarStyle: { backgroundColor: "#007FFF" },
          }}
        >
          <Tab.Screen name="Student" component={StudentReportsScreen} />
          <Tab.Screen name="Teacher" component={TeacherReportsScreen} />
          <Tab.Screen name="Admin" component={AdminReportsScreen} />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MAdminReports;
