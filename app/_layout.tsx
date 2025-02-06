import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="translation" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="result" 
          options={{
            headerShown: true,
            headerTitle: "Menu Translation",
            headerBackTitle: "Camera"
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}