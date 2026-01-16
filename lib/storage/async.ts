import AsyncStorage from "@react-native-async-storage/async-storage";
import { InvoiceRecord, ReminderSettings, WorkLogEntry } from "../../types/models";

const STORAGE_KEYS = {
  workLogs: "workLogs",
  invoices: "invoiceHistory",
  invoiceCounter: "invoiceCounter",
  reminderSettings: "reminderSettings"
};

export const loadWorkLogs = async (): Promise<Record<string, WorkLogEntry>> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.workLogs);
  if (!stored) {
    return {};
  }
  return JSON.parse(stored) as Record<string, WorkLogEntry>;
};

export const saveWorkLogs = async (logs: Record<string, WorkLogEntry>): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.workLogs, JSON.stringify(logs));
};

export const upsertWorkLog = async (entry: WorkLogEntry): Promise<void> => {
  const logs = await loadWorkLogs();
  logs[entry.dateISO] = entry;
  await saveWorkLogs(logs);
};

export const deleteWorkLog = async (dateISO: string): Promise<void> => {
  const logs = await loadWorkLogs();
  delete logs[dateISO];
  await saveWorkLogs(logs);
};

export const loadInvoices = async (): Promise<InvoiceRecord[]> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.invoices);
  if (!stored) {
    return [];
  }
  return JSON.parse(stored) as InvoiceRecord[];
};

export const saveInvoices = async (invoices: InvoiceRecord[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
};

export const getNextInvoiceNumber = async (): Promise<number> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.invoiceCounter);
  if (!stored) {
    return 1;
  }
  const parsed = Number(stored);
  return Number.isNaN(parsed) ? 1 : parsed;
};

export const incrementInvoiceNumber = async (nextNumber: number): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.invoiceCounter, String(nextNumber));
};

export const loadReminderSettings = async (): Promise<ReminderSettings> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.reminderSettings);
  if (!stored) {
    return { enabled: false, time: "17:00" };
  }
  return JSON.parse(stored) as ReminderSettings;
};

export const saveReminderSettings = async (settings: ReminderSettings): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.reminderSettings, JSON.stringify(settings));
};
