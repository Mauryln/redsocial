import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScannerScreen from './src/screens/ScannerScreen';
import SenderScreen from './src/screens/SenderScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Scanner">
        <Stack.Screen 
          name="Scanner" 
          component={ScannerScreen} 
          options={{ title: 'Scan for Pokemon' }}
        />
        <Stack.Screen 
          name="Sender" 
          component={SenderScreen} 
          options={{ title: 'Send Pokemon' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App; 