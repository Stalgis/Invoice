import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { Button, Card, Switch, Text, XStack, YStack } from "tamagui";
import * as Sharing from "expo-sharing";
import Screen from "../components/Screen";
import { buildInvoiceItems, calculateTotals, generateInvoicePdf } from "../lib/invoice";
import { endOfWeekSunday, formatCurrency, formatDateISO, startOfWeekMonday, toDateISO } from "../lib/dates";
import { getProfile } from "../lib/storage/secure";
import { getNextInvoiceNumber, incrementInvoiceNumber, loadInvoices, loadWorkLogs, saveInvoices } from "../lib/storage/async";
import { InvoiceLineItem, InvoiceRecord, UserProfile } from "../types/models";

const InvoicePreview = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [gstIncluded, setGstIncluded] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InvoiceRecord | null>(null);

  const loadData = useCallback(async () => {
    const storedProfile = await getProfile();
    setProfile(storedProfile);

    const logs = await loadWorkLogs();
    const start = toDateISO(startOfWeekMonday(new Date()));
    const end = toDateISO(endOfWeekSunday(new Date()));
    const rate = storedProfile?.hourlyRate ?? 0;
    const lineItems = buildInvoiceItems(logs, start, end, rate);
    setItems(lineItems);

    const nextNumber = await getNextInvoiceNumber();
    setInvoiceNumber(nextNumber);
    setCurrentRecord(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const createRecord = (): InvoiceRecord | null => {
    if (!profile) {
      Alert.alert("Profile missing", "Please complete your profile first.");
      return null;
    }
    if (items.length === 0) {
      Alert.alert("No entries", "Add work logs for this week before invoicing.");
      return null;
    }
    const issueDateISO = toDateISO(new Date());
    const periodStartISO = toDateISO(startOfWeekMonday(new Date()));
    const periodEndISO = toDateISO(endOfWeekSunday(new Date()));
    const totals = calculateTotals(items, gstIncluded);

    return {
      id: `invoice-${invoiceNumber}`,
      number: invoiceNumber,
      issueDateISO,
      periodStartISO,
      periodEndISO,
      items,
      subtotal: totals.subtotal,
      gstIncluded,
      gstAmount: totals.gstAmount,
      total: totals.total
    };
  };

  const saveInvoice = async (record: InvoiceRecord) => {
    const existing = await loadInvoices();
    const updated = existing.filter((invoice) => invoice.id !== record.id);
    updated.unshift(record);
    await saveInvoices(updated);
  };

  const handleGenerate = async () => {
    const record = createRecord();
    if (!record || !profile) {
      return;
    }
    const pdfUri = await generateInvoicePdf(profile, record);
    const savedRecord = { ...record, pdfUri };
    await saveInvoice(savedRecord);
    await incrementInvoiceNumber(invoiceNumber + 1);
    setInvoiceNumber(invoiceNumber + 1);
    setCurrentRecord(savedRecord);
    Alert.alert("Invoice ready", "PDF generated and saved to history.");
  };

  const handleShare = async () => {
    const record = currentRecord ?? createRecord();
    if (!record || !profile) {
      return;
    }
    let pdfUri = record.pdfUri;
    if (!pdfUri) {
      pdfUri = await generateInvoicePdf(profile, record);
      const savedRecord = { ...record, pdfUri };
      await saveInvoice(savedRecord);
      if (!currentRecord) {
        await incrementInvoiceNumber(invoiceNumber + 1);
        setInvoiceNumber(invoiceNumber + 1);
      }
      setCurrentRecord(savedRecord);
    }
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing unavailable", "Sharing is not available on this device.");
      return;
    }
    await Sharing.shareAsync(pdfUri);
  };

  const totals = calculateTotals(items, gstIncluded);

  return (
    <Screen>
      <Text fontSize="$7" fontWeight="700">
        Invoice preview
      </Text>

      <Card padding="$3" backgroundColor="$gray2">
        <YStack gap="$2">
          <Text fontWeight="600">Invoice #{invoiceNumber}</Text>
          <Text color="$gray10">Issue date: {formatDateISO(toDateISO(new Date()))}</Text>
          <Text color="$gray10">
            Period: {formatDateISO(toDateISO(startOfWeekMonday(new Date())))} -{" "}
            {formatDateISO(toDateISO(endOfWeekSunday(new Date())))}
          </Text>
        </YStack>
      </Card>

      <YStack gap="$2">
        {items.map((item) => (
          <Card key={item.dateISO} padding="$3" backgroundColor="$gray1">
            <Text fontWeight="600">{formatDateISO(item.dateISO)}</Text>
            <Text color="$gray10">{item.description || "No description"}</Text>
            <XStack justifyContent="space-between">
              <Text>{item.hours.toFixed(2)} hrs</Text>
              <Text>{formatCurrency(item.lineTotal)}</Text>
            </XStack>
          </Card>
        ))}
      </YStack>

      <Card padding="$3" backgroundColor="$gray2">
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontWeight="600">Include GST (10%)</Text>
            <Switch checked={gstIncluded} onCheckedChange={setGstIncluded} />
          </XStack>
          <Text>Subtotal: {formatCurrency(totals.subtotal)}</Text>
          <Text>GST: {formatCurrency(totals.gstAmount)}</Text>
          <Text fontWeight="700">Total: {formatCurrency(totals.total)}</Text>
        </YStack>
      </Card>

      <Button onPress={handleGenerate}>Generate PDF</Button>
      <Button onPress={handleShare}>Share PDF</Button>
    </Screen>
  );
};

export default InvoicePreview;
