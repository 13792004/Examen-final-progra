import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="tareas.db">
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </SQLiteProvider>
  );
}
