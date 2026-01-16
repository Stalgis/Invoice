import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import Screen from "../components/Screen";
import { listWeekDays, formatDate, formatDateShort, toDateISO } from "../lib/dates";
import { loadWorkLogs } from "../lib/storage/async";
import { WorkLogEntry } from "../types/models";

const WeekEntries = () => {
  const [entries, setEntries] = useState<Record<string, WorkLogEntry>>({});

  const loadEntries = useCallback(async () => {
    const stored = await loadWorkLogs();
    setEntries(stored);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const days = listWeekDays(new Date());
  const missingDays = days.filter((day) => !entries[toDateISO(day)]);

  return (
    <Screen>
      <Text fontSize="$7" fontWeight="700">
        Week entries
      </Text>

      <YStack gap="$3">
        {days.map((day) => {
          const dateISO = toDateISO(day);
          const entry = entries[dateISO];
          return (
            <Card key={dateISO} padding="$3" backgroundColor="$gray2">
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text fontWeight="600">{formatDate(day)}</Text>
                  {entry ? (
                    <Text color="$gray10">
                      {entry.hours.toFixed(2)} hrs · {entry.description || "No description"}
                    </Text>
                  ) : (
                    <Text color="$gray10">No entry</Text>
                  )}
                </YStack>
                <Button
                  size="$2"
                  onPress={() => router.push({ pathname: "/log", params: { date: dateISO } })}
                >
                  {entry ? "Edit" : "Add"}
                </Button>
              </XStack>
            </Card>
          );
        })}
      </YStack>

      {missingDays.length > 0 && (
        <Card padding="$3" backgroundColor="$yellow2">
          <Text fontWeight="600">Missing days</Text>
          <Text color="$gray10">
            {missingDays.map((day) => formatDateShort(day)).join(", ")}
          </Text>
        </Card>
      )}
    </Screen>
  );
};

export default WeekEntries;
