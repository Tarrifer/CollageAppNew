import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const TeacherNoticeScreen = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setIsLoading(true);
    const noticeQuery = query(collection(db, 'Adminnotices'), where('recipient', '==', 'Teacher'));
    const noticeSnapshot = await getDocs(noticeQuery);
    const noticeData = noticeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setNotices(noticeData);
    setIsLoading(false);
  };

  const isNewNotice = (createdAt) => {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
    const now = new Date();
    const createdDate = new Date(createdAt.seconds * 1000); // convert to milliseconds
    return now - createdDate < oneDay;
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Notice Screen</Text>
      <FlatList
        data={notices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{item.text}</Text>
            {isNewNotice(item.createdAt) && <Text style={styles.newLabel}>New</Text>}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  noticeCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 16,
  },
  newLabel: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default TeacherNoticeScreen;
