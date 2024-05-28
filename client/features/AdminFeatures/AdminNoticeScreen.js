import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Modal, Button, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase'; // Import your Firebase configuration
import { FontAwesome5 } from '@expo/vector-icons';

const AdminNoticeScreen = () => {
  const [notices, setNotices] = useState([]);
  const [input, setInput] = useState('');
  const [recipient, setRecipient] = useState('Student');
  const [isLoading, setIsLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editInput, setEditInput] = useState('');
  const [editRecipient, setEditRecipient] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setIsLoading(true);
    const noticeSnapshot = await getDocs(collection(db, 'Adminnotices'));
    const noticeData = noticeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setNotices(noticeData);
    setIsLoading(false);
  };

  const handleAddNotice = async () => {
    if (input.trim() === '') {
      Alert.alert('Invalid input!', 'Please enter a valid notice.', [
        { text: 'Okay' },
      ]);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'Adminnotices'), {
        text: input,
        recipient,
        createdAt: new Date(),
      });
      setNotices((oldNotices) => [
        ...oldNotices,
        { id: docRef.id, text: input, recipient },
      ]);
      setInput('');
      Alert.alert('Notice added!', 'Your notice has been successfully added.', [
        { text: 'Okay' },
      ]);
    } catch (error) {
      console.error('Error adding notice: ', error);
      Alert.alert('Error', 'An error occurred while adding the notice.', [
        { text: 'Okay' },
      ]);
    }
  };

  const handleDeleteNotice = async (id) => {
    await deleteDoc(doc(db, 'Adminnotices', id));
    setNotices(oldNotices => oldNotices.filter(notice => notice.id !== id));
    Alert.alert('Notice deleted!', 'The notice has been successfully deleted.', [{ text: 'Okay' }]);
  };

  const handleEditNotice = async () => {
    if (editInput.trim() === '') {
      Alert.alert('Invalid input!', 'Please enter a valid notice.', [{ text: 'Okay' }]);
      return;
    }

    await updateDoc(doc(db, 'Adminnotices', editId), { text: editInput, recipient: editRecipient });
    setNotices(oldNotices => oldNotices.map(notice => notice.id === editId ? { ...notice, text: editInput, recipient: editRecipient } : notice));
    setEditModalVisible(false);
    Alert.alert('Notice updated!', 'The notice has been successfully updated.', [{ text: 'Okay' }]);
  };

  const openEditModal = (id, text, recipient) => {
    setEditId(id);
    setEditInput(text);
    setEditRecipient(recipient);
    setEditModalVisible(true);
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Notice Screen</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter Notice"
          style={styles.input}
          onChangeText={setInput}
          value={input}
        />
        <Text style={styles.noticeText}>Send Notice to</Text>
        <Picker
          selectedValue={recipient}
          style={styles.picker}
          onValueChange={(itemValue) => setRecipient(itemValue)}
        >
          <Picker.Item label="Student" value="Student" />
          <Picker.Item label="Teacher" value="Teacher" />
        </Picker>
        <Button
          title="ADD"
          onPress={handleAddNotice}
          color="#841584"
          style={styles.button}
        />
      </View>
      <FlatList
        data={notices}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.noticeContent}>
              <Text style={styles.notice}>{item.text}</Text>
              <Text style={styles.recipient}>Recipient: {item.recipient}</Text>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => handleDeleteNotice(item.id)}>
                <FontAwesome5 name="trash-alt" size={24} color="#f00" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openEditModal(item.id, item.text, item.recipient)}>
                <FontAwesome5 name="edit" size={24} color="#00f" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Notice</Text>
            <TextInput
              placeholder="Enter Notice"
              style={[styles.input, styles.modalInput]}
              onChangeText={setEditInput}
              value={editInput}
            />
            <Picker
              selectedValue={editRecipient}
              style={[styles.modalPicker]}
              onValueChange={(itemValue) => setEditRecipient(itemValue)}
            >
              <Picker.Item label="Student" value="Student" />
              <Picker.Item label="Teacher" value="Teacher" />
            </Picker>
            <View style={styles.modalButtons}>
              <Button
                title="UPDATE"
                onPress={handleEditNotice}
                color="#841584"
                style={styles.modalButton}
              />
              <Button
                title="CANCEL"
                onPress={() => setEditModalVisible(false)}
                color="#841584"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    borderRadius: 8,
  },
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  listItem: {
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
  noticeContent: {
    flex: 1,
    marginRight: 10,
  },
  notice: {
    fontSize: 16,
    marginBottom: 5,
  },
  recipient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 80,
  },
  noticeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: "100%",
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    width: '40%',
  },
  modalInput: {
    width: '100%',
    marginBottom: 20,
  },
  modalPicker: {
    width: '100%',
    marginBottom: 20,
  },
 });
 
 export default AdminNoticeScreen;