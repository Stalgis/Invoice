import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

const REMINDER_CONTENT = {
  title: "Invoice Builder",
  body: "Remember to log today's hours."
};

const ensurePermissions = async (): Promise<boolean> => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status === "granted") {
    return true;
  }
  const request = await Notifications.requestPermissionsAsync();
  return request.status === "granted";
};

const secondsUntil = (target: Date, now: Date): number =>
  Math.max(60, Math.floor((target.getTime() - now.getTime()) / 1000));

export const scheduleDailyReminder = async (
  hour: number,
  minute: number,
  skipToday: boolean
): Promise<string | null> => {
  const permitted = await ensurePermissions();
  if (!permitted) {
    return null;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  if (skipToday && next.toDateString() === now.toDateString()) {
    next.setDate(next.getDate() + 1);
  }

  const seconds = secondsUntil(next, now);
  return Notifications.scheduleNotificationAsync({
    content: REMINDER_CONTENT,
    trigger: {
      seconds,
      repeats: true
    }
  });
};

export const cancelDailyReminder = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
