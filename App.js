import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import store from "./client/context/store";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// const auth = initializeAuth(App, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage),
// });
import * as SplashScreen from "expo-splash-screen";

// import MainNavigator from "./client/navigation/MainNavigator";
// import LoginProvider from "./client/context/LoginProvider";
import { AuthStack } from "./client/navigation/navigation";
export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
        // Prevent the splash screen from auto-hiding
        await SplashScreen.preventAutoHideAsync();
        // Artificial delay to simulate loading
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // After the delay, hide the splash screen
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        {/* <MainNavigator /> */}
        <AuthStack />
      </NavigationContainer>
    </Provider>
  );
}

// import * as React from 'react';
// import { View, Text, Image, TouchableOpacity, Button } from 'react-native';

// import {
//   createDrawerNavigator,
//   DrawerContentScrollView,
//   DrawerItemList,
// } from '@react-navigation/drawer';
// import { NavigationContainer } from '@react-navigation/native';

// function Home({ navigation }) {
//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <Text>Home</Text>
//       {/* <Button onPress={() => navigation.toggleDrawer()} title='test' /> */}
//     </View>
//   );
// }

// function Tasks() {
//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <Text>Tasks</Text>
//     </View>
//   );
// }

// const Drawer = createDrawerNavigator();

// const CustomDrawer = props => {
//   return (
//     <View style={{ flex: 1 }}>
//       <DrawerContentScrollView {...props}>
//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             padding: 20,
//             backgroundColor: '#f6f6f6',
//             marginBottom: 20,
//           }}
//         >
//           <View>
//             <Text>John Doe</Text>
//             <Text>example@email.com</Text>
//           </View>
//           <Image
//             source={{
//               uri: 'https://images.unsplash.com/photo-1624243225303-261cc3cd2fbc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
//             }}
//             style={{ width: 60, height: 60, borderRadius: 30 }}
//           />
//         </View>
//         <DrawerItemList {...props} />
//       </DrawerContentScrollView>
//       <TouchableOpacity
//         style={{
//           position: 'absolute',
//           right: 0,
//           left: 0,
//           bottom: 50,
//           backgroundColor: '#f6f6f6',
//           padding: 20,
//         }}
//       >
//         <Text>Log Out</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const DrawerNavigator = () => {
//   return (
//     <Drawer.Navigator
//       screenOptions={{
//         headerShown: true,
//         headerStyle: {
//           backgroundColor: 'transparent',
//           elevation: 0,
//           shadowOpacity: 0,
//         },
//         headerTitle: '',
//       }}
//       drawerContent={props => <CustomDrawer {...props} />}
//     >
//       <Drawer.Screen component={Home} name='Home' />
//       <Drawer.Screen component={Tasks} name='Tasks' />
//     </Drawer.Navigator>
//   );
// };

// export default function App() {
//   return (
//     <NavigationContainer>
//       <DrawerNavigator />
//     </NavigationContainer>
//   );
// }
