import { createAnimations } from "@tamagui/animations-react-native";
import { config } from "@tamagui/config";
import { createTamagui } from "tamagui";

const animations = createAnimations({
  bouncy: {
    type: "spring",
    damping: 10,
    mass: 0.9,
    stiffness: 100
  },
  lazy: {
    type: "spring",
    damping: 20,
    stiffness: 60
  },
  quick: {
    type: "spring",
    damping: 20,
    mass: 1.2,
    stiffness: 250
  }
});

const appConfig = createTamagui({
  ...config,
  animations
});

export default appConfig;

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
