import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const UserDetails = ({ user, userType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUserData({
      email: user.email,
      uid: user.uid,
      name: user.name,
      schoolName: user.schoolName,
      department: user.department,
      registerNumber: user.registerNumber,
      rollNumber: user.rollNumber,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      imageUrl: user.imageUrl,
    });
  }, [user]);

  const handleInputChange = (field, value) => {
    setUserData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userRef = doc(db, `${userType}s`, user.authId);
      await updateDoc(userRef, userData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              editable={isEditing}
            />
          </View>
          {/* Render other user details similarly */}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <Button
                  title="Update"
                  onPress={handleUpdateUser}
                  disabled={isLoading}
                />
                <Button title="Cancel" onPress={handleEditToggle} />
              </>
            ) : (
              <Button title="Edit" onPress={handleEditToggle} />
            )}
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
});

export default UserDetails;