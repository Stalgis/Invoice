import { useState } from "react";
import { Alert } from "react-native";
import { Button, Input, Text, YStack } from "tamagui";
import { router } from "expo-router";
import Screen from "../components/Screen";
import { saveProfile } from "../lib/storage/secure";

const Onboarding = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [abn, setAbn] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName || !email || !address || !phone || !abn || !hourlyRate) {
      Alert.alert("Missing details", "Please fill in all required fields.");
      return;
    }
    const rate = Number(hourlyRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      Alert.alert("Invalid rate", "Hourly rate must be a positive number.");
      return;
    }

    setSaving(true);
    await saveProfile({
      fullName,
      email,
      address,
      phone,
      abn,
      hourlyRate: rate
    });
    setSaving(false);
    router.replace("/home");
  };

  return (
    <Screen>
      <YStack gap="$3">
        <Text fontSize="$8" fontWeight="700">
          Welcome
        </Text>
        <Text color="$gray10">Set up your invoice profile.</Text>
      </YStack>

      <YStack gap="$3">
        <Input placeholder="Full name" value={fullName} onChangeText={setFullName} />
        <Input placeholder="Email" value={email} onChangeText={setEmail} />
        <Input placeholder="Address" value={address} onChangeText={setAddress} />
        <Input placeholder="Phone" value={phone} onChangeText={setPhone} />
        <Input placeholder="ABN" value={abn} onChangeText={setAbn} />
        <Input
          placeholder="Hourly rate (AUD)"
          keyboardType="decimal-pad"
          value={hourlyRate}
          onChangeText={setHourlyRate}
        />
      </YStack>

      <Button onPress={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save profile"}
      </Button>
    </Screen>
  );
};

export default Onboarding;
