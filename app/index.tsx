import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { YStack } from "tamagui";
import { getProfile } from "../lib/storage/secure";

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const profile = await getProfile();
      if (profile) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
      setLoading(false);
    };
    load();
  }, []);

  if (!loading) {
    return null;
  }

  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <ActivityIndicator size="large" />
    </YStack>
  );
};

export default Index;
