import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { getAuth } from "firebase/auth";
import moment from "moment";

const StudentAttendanceScreen = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setIsLoading] = useState(false);
  // Sample data for subjects attendance
  const subjectsAttendance = [
    { subject: "Math", absent: 2, present: 18 },
    { subject: "Science", absent: 3, present: 17 },
    // Add more subjects as needed
  ];

  let totalClasses = 20;

  // Function to calculate attendance percentage
  const calculateAttendancePercentage = (totalClasses, present) => {
    return ((present / totalClasses) * 100).toFixed(2);
  };
  const auth = getAuth();
  const currentUser = auth?.currentUser?.email;


  const fetchAttendanceData = async () => {
    const collections = collection(db, "Students");
    const allDocs = await getDocs(collections);
    const fetchedDocs = [];
    for (const allDoc of allDocs.docs) {
      const attendanceCollection = collection(
        db,
        "Students",
        allDoc.id,
        "attendance"
      );
      const q = query(attendanceCollection);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedDocs.push({
          authId: doc.id,
          ...data,
        });
      });
    }
    setAttendanceData(fetchedDocs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);


  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Subject Attendance</Text>
          {/* <Text style={styles.date}>{new Date().toLocaleDateString()}</Text> */}
        </View>
        {attendanceData
          .filter((data) => data.email === currentUser) // Filter the array
          .map((attendance, index) => {
            const date = attendance.date.seconds
              ? new Date(attendance.date.seconds * 1000)
              : null;
            return (
              <View key={index} style={styles.card}>
                <Text style={styles.subjectName}>{attendance.subject}</Text>
                {date && (
                  <Text style={styles.dateText}>
                    Date: {moment(date).format("MMMM Do YYYY, h:mm:ss a")}
                  </Text>
                )}
                <View style={styles.attendanceRow}>
                  {/* <View style={[styles.attendanceItem, styles.absent]}>
                    <Text style={styles.attendanceText}>
                      Absent:
                    </Text>
                  </View> */}
                  <View style={[styles.attendanceItem, styles.present]}>
                    <Text style={styles.attendanceText}>
                      Present: {/* Calculate present count */}
                    </Text>
                  </View>
                </View>
                {/* <View style={styles.attendanceContainer}>
                  <Text style={styles.attendanceLabel}>Subject Attendance</Text>
                  <Text style={styles.percentage}>
                    {calculateAttendancePercentage(attendance.present)}%
                  </Text>
                </View> */}
                {/* <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `` }]} />
                </View> */}
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
};

export default StudentAttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  attendanceRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  attendanceItem: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  absent: {
    backgroundColor: "red",
  },
  present: {
    backgroundColor: "green",
  },
  attendanceText: {
    color: "#fff",
  },
  attendanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  attendanceLabel: {
    color: "#000",
    fontWeight: "bold",
  },
  progressContainer: {
    height: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  percentage: {
    textAlign: "center",
  },
  dateText: {
    marginBottom: 5,
  },
});
