import { Stack } from "expo-router";
import { TamaguiProvider, Theme, YStack } from "tamagui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import appConfig from "../tamagui.config";

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={appConfig}>
        <Theme name="light">
          <YStack flex={1} backgroundColor="$background">
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: "#ffffff" },
                headerTitleStyle: { color: "#111" }
              }}
            />
          </YStack>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
