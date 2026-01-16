import { useCallback, useState } from "react";
import { Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { Button, Card, Switch, Text, XStack, YStack } from "tamagui";
import Screen from "../components/Screen";
import { loadReminderSettings, saveReminderSettings, loadWorkLogs } from "../lib/storage/async";
import { scheduleDailyReminder, cancelDailyReminder } from "../lib/notifications";
import { toDateISO } from "../lib/dates";

const parseTime = (time: string): Date => {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

const ReminderSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("17:00");
  const [showPicker, setShowPicker] = useState(false);

  const loadSettings = useCallback(async () => {
    const settings = await loadReminderSettings();
    setEnabled(settings.enabled);
    setTime(settings.time);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const applySettings = async (nextEnabled: boolean, nextTime: string) => {
    await saveReminderSettings({ enabled: nextEnabled, time: nextTime });
    if (!nextEnabled) {
      await cancelDailyReminder();
      return;
    }

    const logs = await loadWorkLogs();
    const todayISO = toDateISO(new Date());
    const loggedToday = Boolean(logs[todayISO]);
    const [hour, minute] = nextTime.split(":").map(Number);
    await scheduleDailyReminder(hour, minute, loggedToday);
  };

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    await applySettings(value, time);
  };

  const handleTimeChange = async (selectedDate?: Date) => {
    if (!selectedDate) {
      return;
    }
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();
    const nextTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    setTime(nextTime);
    await applySettings(enabled, nextTime);
  };

  return (
    <Screen>
      <Text fontSize="$7" fontWeight="700">
        Reminder settings
      </Text>

      <Card padding="$3" backgroundColor="$gray2">
        <XStack alignItems="center" justifyContent="space-between">
          <YStack>
            <Text fontWeight="600">Daily reminder</Text>
            <Text color="$gray10">Get a nudge to log today’s hours.</Text>
          </YStack>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </XStack>
      </Card>

      <Card padding="$3" backgroundColor="$gray2">
        <YStack gap="$2">
          <Text fontWeight="600">Reminder time</Text>
          <Text color="$gray10">Current: {time}</Text>
          <Button size="$2" onPress={() => setShowPicker(true)}>
            Change time
          </Button>
          {showPicker && (
            <DateTimePicker
              value={parseTime(time)}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                setShowPicker(Platform.OS === "ios");
                handleTimeChange(selectedDate ?? undefined);
              }}
            />
          )}
        </YStack>
      </Card>
    </Screen>
  );
};

export default ReminderSettings;
