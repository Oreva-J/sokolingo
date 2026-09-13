import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#6C4EF5" size="large" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-10">
      <Text className="font-poppins-semibold text-[30px] text-text-primary">
        Welcome back
      </Text>
      <Text className="mt-3 font-poppins text-[16px] text-text-secondary">
        You are signed in and ready to learn.
      </Text>
    </View>
  );
}
