import { ReactNode } from "react";
import { ScrollView, YStack } from "tamagui";

type ScreenProps = {
  children: ReactNode;
};

const Screen = ({ children }: ScreenProps) => (
  <ScrollView backgroundColor="$background" contentContainerStyle={{ padding: 16 }}>
    <YStack gap="$4">{children}</YStack>
  </ScrollView>
);

export default Screen;
