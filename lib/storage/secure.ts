import * as SecureStore from "expo-secure-store";
import { UserProfile } from "../../types/models";

const PROFILE_KEYS = {
  fullName: "profile.fullName",
  email: "profile.email",
  address: "profile.address",
  phone: "profile.phone",
  abn: "profile.abn",
  hourlyRate: "profile.hourlyRate"
};

export const getProfile = async (): Promise<UserProfile | null> => {
  const [fullName, email, address, phone, abn, hourlyRate] = await Promise.all([
    SecureStore.getItemAsync(PROFILE_KEYS.fullName),
    SecureStore.getItemAsync(PROFILE_KEYS.email),
    SecureStore.getItemAsync(PROFILE_KEYS.address),
    SecureStore.getItemAsync(PROFILE_KEYS.phone),
    SecureStore.getItemAsync(PROFILE_KEYS.abn),
    SecureStore.getItemAsync(PROFILE_KEYS.hourlyRate)
  ]);

  if (!fullName || !email || !address || !phone || !abn || !hourlyRate) {
    return null;
  }

  const hourlyRateNumber = Number(hourlyRate);
  if (Number.isNaN(hourlyRateNumber)) {
    return null;
  }

  return {
    fullName,
    email,
    address,
    phone,
    abn,
    hourlyRate: hourlyRateNumber
  };
};

export const saveProfile = async (profile: UserProfile): Promise<void> => {
  await Promise.all([
    SecureStore.setItemAsync(PROFILE_KEYS.fullName, profile.fullName),
    SecureStore.setItemAsync(PROFILE_KEYS.email, profile.email),
    SecureStore.setItemAsync(PROFILE_KEYS.address, profile.address),
    SecureStore.setItemAsync(PROFILE_KEYS.phone, profile.phone),
    SecureStore.setItemAsync(PROFILE_KEYS.abn, profile.abn),
    SecureStore.setItemAsync(PROFILE_KEYS.hourlyRate, String(profile.hourlyRate))
  ]);
};
