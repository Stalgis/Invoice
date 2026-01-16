import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, router } from "expo-router";
import { Button, Input, Text, XStack, YStack } from "tamagui";
import Screen from "../components/Screen";
import { deleteWorkLog, loadWorkLogs, upsertWorkLog } from "../lib/storage/async";
import { formatDate, toDateISO } from "../lib/dates";
import { WorkLogEntry } from "../types/models";

const LogHours = () => {
  const params = useLocalSearchParams<{ date?: string }>();
  const initialDate = params.date ? new Date(params.date) : new Date();
  const [date, setDate] = useState<Date>(initialDate);
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [existingEntry, setExistingEntry] = useState<WorkLogEntry | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const loadEntry = useCallback(async (targetDate: Date) => {
    const logs = await loadWorkLogs();
    const dateISO = toDateISO(targetDate);
    const entry = logs[dateISO] ?? null;
    setExistingEntry(entry);
    setHours(entry ? String(entry.hours) : "");
    setDescription(entry ? entry.description : "");
  }, []);

  useEffect(() => {
    loadEntry(date);
  }, [date, loadEntry]);

  const handleSave = async () => {
    const parsedHours = Number(hours);
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      Alert.alert("Invalid hours", "Please enter a positive number of hours.");
      return;
    }

    const nowISO = new Date().toISOString();
    const dateISO = toDateISO(date);
    const entry: WorkLogEntry = {
      id: existingEntry?.id ?? `entry-${dateISO}`,
      dateISO,
      hours: parsedHours,
      description,
      createdAtISO: existingEntry?.createdAtISO ?? nowISO,
      updatedAtISO: nowISO
    };

    await upsertWorkLog(entry);
    Alert.alert("Saved", "Your hours were saved.");
    router.back();
  };

  const handleDelete = async () => {
    if (!existingEntry) {
      return;
    }
    Alert.alert("Delete entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteWorkLog(existingEntry.dateISO);
          Alert.alert("Deleted", "Your entry was deleted.");
          router.back();
        }
      }
    ]);
  };

  return (
    <Screen>
      <YStack gap="$3">
        <Text fontSize="$7" fontWeight="700">
          Log Hours
        </Text>
        <XStack alignItems="center" gap="$2">
          <Text>{formatDate(date)}</Text>
          <Button size="$2" onPress={() => setShowPicker(true)}>
            Change
          </Button>
        </XStack>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(_, selectedDate) => {
              setShowPicker(Platform.OS === "ios");
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}
      </YStack>

      <YStack gap="$3">
        <Input
          placeholder="Hours (e.g., 7.5)"
          keyboardType="decimal-pad"
          value={hours}
          onChangeText={setHours}
        />
        <Input
          placeholder="Work done"
          value={description}
          onChangeText={setDescription}
        />
      </YStack>

      <Button onPress={handleSave}>Save</Button>
      {existingEntry && (
        <Button theme="red" onPress={handleDelete}>
          Delete
        </Button>
      )}
    </Screen>
  );
};

export default LogHours;
