import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useApp } from "./appcontext";

export default function Index() {
  const { memberName, familyGroup, loading } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (!memberName) {
    return <Redirect href="/joinscreen" />;
  }

  if (!familyGroup) {
    return <Redirect href="/joinscreen" />;
  }
  return <Redirect href="/grocerylistscreen" />;
}
