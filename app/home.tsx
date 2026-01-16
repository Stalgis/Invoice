import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { Button, Card, Text, YStack } from "tamagui";
import Screen from "../components/Screen";
import { getProfile } from "../lib/storage/secure";
import { loadWorkLogs } from "../lib/storage/async";
import { endOfWeekSunday, formatCurrency, startOfWeekMonday, toDateISO } from "../lib/dates";
import { UserProfile } from "../types/models";

const Home = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [totalHours, setTotalHours] = useState(0);

  const loadData = useCallback(async () => {
    const storedProfile = await getProfile();
    setProfile(storedProfile);

    const logs = await loadWorkLogs();
    const start = toDateISO(startOfWeekMonday(new Date()));
    const end = toDateISO(endOfWeekSunday(new Date()));
    const weeklyEntries = Object.values(logs).filter(
      (entry) => entry.dateISO >= start && entry.dateISO <= end
    );
    const hours = weeklyEntries.reduce((sum, entry) => sum + entry.hours, 0);
    setTotalHours(hours);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const hourlyRate = profile?.hourlyRate ?? 0;
  const invoiceTotal = totalHours * hourlyRate;

  return (
    <Screen>
      <Text fontSize="$8" fontWeight="700">
        Dashboard
      </Text>

      <Card padding="$4" backgroundColor="$blue2">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="600">
            This week
          </Text>
          <Text>Total hours: {totalHours.toFixed(2)}</Text>
          <Text>Hourly rate: {formatCurrency(hourlyRate)}</Text>
          <Text fontWeight="700">Invoice total: {formatCurrency(invoiceTotal)}</Text>
        </YStack>
      </Card>

      <YStack gap="$3">
        <Button onPress={() => router.push({ pathname: "/log", params: { date: "" } })}>
          Log today
        </Button>
        <Button onPress={() => router.push("/week")}>Edit week</Button>
        <Button onPress={() => router.push("/invoice-preview")}>Generate invoice</Button>
        <Button onPress={() => router.push("/reminders")}>Reminder settings</Button>
        <Button onPress={() => router.push("/history")}>Invoice history</Button>
      </YStack>
    </Screen>
  );
};

export default Home;
