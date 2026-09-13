import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-10">
      <Link href="/onboarding" asChild>
        <Pressable className="rounded-control bg-purple px-8 py-4">
          <Text className="font-poppins-semibold text-base text-white">
            Open onboarding
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
