import { Image } from "expo-image";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";

export default function Onboarding() {
  const { width, height } = useWindowDimensions();
  const mascotSize = Math.min(width * 0.74, height * 0.32, 310);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#ffffff" }}
    >
      <StatusBar style="dark" />
      <View className="flex-1 px-10 pb-4">
        <View className="items-center pt-3">
          <View className="flex-row items-center gap-2">
            <Image
              source={images.mascotLogo}
              contentFit="contain"
              accessibilityLabel="Sokolingo mascot"
              style={{ width: 56, height: 56 }}
            />
            <Text className="font-poppins-semibold text-[30px] leading-9 text-text-primary">
              sokolingo
            </Text>
          </View>
        </View>

        <View className="mt-5">
          <Text className="font-poppins-semibold text-[32px] leading-8 text-text-primary">
            Your AI language
            {"\n"}
            <Text className="font-poppins-bold text-purple">teacher.</Text>
          </Text>
          <Text className="mt-2 font-poppins text-[16px] leading-7 text-text-secondary">
            Real conversations, personalized
            {"\n"}
            lessons, anytime, anywhere.
          </Text>
        </View>

        <View className="relative mt-2 flex-1 items-center">
          <View className="absolute left-0 top-12 rotate-[-8deg] rounded-[20px] bg-[#eef8ff] px-6 py-4">
            <Text className="font-poppins-medium text-[24px] text-text-primary">
              Hello!
            </Text>
          </View>
          <View className="absolute right-0 top-2 rotate-10 rounded-[20px] bg-[#f7f6ff] px-6 py-4">
            <Text className="font-poppins-semibold text-[24px] text-purple">
              ¡Hola!
            </Text>
          </View>
          <View className="absolute right-0 top-36 rotate-[8deg] rounded-[20px] bg-[#fff5ef] px-6 py-4">
            <Text className="font-poppins-medium text-[24px] text-[#ff4f36]">
              你好!
            </Text>
          </View>
          <Image
            source={images.mascotWelcome}
            contentFit="contain"
            accessibilityLabel="Fox language teacher with a backpack"
            style={{ width: mascotSize, height: mascotSize, marginTop: 72 }}
          />
        </View>

        <Link href="/" asChild>
          <Pressable className="h-18 flex-row items-center justify-center rounded-[25px] bg-deep-purple">
            <Text className="font-poppins-semibold text-[20px] text-white">
              Get Started
            </Text>
            <Text className="ml-8 font-poppins text-[36px] leading-[36px] text-white">
              ›
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
