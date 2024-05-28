import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MAdminCreationScreen from "./MAdminCreationScreen";
import MAdminViewScreen from "./MAdminViewScreen";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createMaterialTopTabNavigator();

const MAdminDataBaseCreation = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "blue",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: {
            backgroundColor: "blue",
          },
        }}
      >
        <Tab.Screen name="Creation Screen" component={MAdminCreationScreen} />
        <Tab.Screen name="View Screen" component={MAdminViewScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "#f0f0f0",
  },
});

export default MAdminDataBaseCreation;
