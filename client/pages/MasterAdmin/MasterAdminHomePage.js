import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BackHandler, Alert } from "react-native";
import {
  DrawerActions,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BigCardCollage } from "../../features/MasterAdminFeatures/MACustomization";

const MasterAdminHomePage = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const handleBackPress = () => {
    if (isFocused) {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit?",
        [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [isFocused]); // Add isFocused to the dependency array

  const handleNotifications = () => {
    navigation.navigate("Notification");
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const [collageName, setCollageName] = useState(
    route.params?.collageName || ""
  );
  const [image, setImage] = useState(route.params?.image || null);

  useEffect(() => {
    setCollageName(route.params?.collageName || "Collage Name");
    setImage(route.params?.image || null);
  }, [route.params?.collageName, route.params?.image]);

  const handleCardPress = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.iconContainer}>
            <Ionicons name="menu" size={30} color="black" />
          </TouchableOpacity>

          <Text style={styles.headerText}>My College App</Text>

          <TouchableOpacity
            onPress={handleNotifications}
            style={styles.iconContainer}
          >
            <Ionicons name="notifications" size={30} color="black" />
          </TouchableOpacity>
        </View>

        <BigCardCollage
          onPress={() => handleCardPress("Customization")}
          collageName={collageName}
          image={image}
        />

        <View style={styles.features}>
          <Text style={styles.featuresText}>Features</Text>
        </View>

        <View style={styles.cards}>
          <TouchableOpacity
            onPress={() => handleCardPress("DataBaseCreation")}
            style={styles.card}
          >
            <Text style={styles.cardText}>DataBase Creation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCardPress("RegistrationApproval")}
            style={styles.card}
          >
            <Text style={styles.cardText}>Registration Approval</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCardPress("CalendarCreation")}
            style={styles.card}
          >
            <Text style={styles.cardText}>Calendar Creation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCardPress("MasterReports")}
            style={styles.card}
          >
            <Text style={styles.cardText}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCardPress("MasterOnlineLibrary")}
            style={styles.card}
          >
            <Text style={styles.cardText}>Online Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCardPress("ERPLink")}
            style={styles.card}
          >
            <Text style={styles.cardText}>ERP Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCardPress("Monitoring")}
            style={styles.card}
          >
            <Text style={styles.cardText}>Monitoring</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCardPress("Settings")}
            style={styles.card}
          >
            <Text style={styles.cardText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CAE6FF",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#CAE6FF",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    fontFamily: "sans-serif"
  },
  iconContainer: {
    padding: 5,
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  card: {
    width: "40%",
    aspectRatio: 1,
    backgroundColor: "teal",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  features: {
    padding: 10,
    alignItems: "center",
  },
  featuresText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
});

export default MasterAdminHomePage;
