import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import * as Sharing from "expo-sharing";
import Screen from "../../components/Screen";
import { formatCurrency, formatDateISO } from "../../lib/dates";
import { getProfile } from "../../lib/storage/secure";
import { loadInvoices, saveInvoices } from "../../lib/storage/async";
import { generateInvoicePdf } from "../../lib/invoice";
import { InvoiceRecord, UserProfile } from "../../types/models";

const InvoiceDetail = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadData = useCallback(async () => {
    const stored = await loadInvoices();
    const found = stored.find((item) => item.id === params.id) ?? null;
    setInvoice(found);
    const storedProfile = await getProfile();
    setProfile(storedProfile);
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const updateInvoice = async (updated: InvoiceRecord) => {
    const stored = await loadInvoices();
    const next = stored.map((item) => (item.id === updated.id ? updated : item));
    await saveInvoices(next);
    setInvoice(updated);
  };

  const handleGenerate = async () => {
    if (!invoice || !profile) {
      Alert.alert("Missing data", "Profile or invoice missing.");
      return;
    }
    const pdfUri = await generateInvoicePdf(profile, invoice);
    await updateInvoice({ ...invoice, pdfUri });
    Alert.alert("PDF ready", "Invoice PDF regenerated.");
  };

  const handleShare = async () => {
    if (!invoice || !profile) {
      return;
    }
    let pdfUri = invoice.pdfUri;
    if (!pdfUri) {
      pdfUri = await generateInvoicePdf(profile, invoice);
      await updateInvoice({ ...invoice, pdfUri });
    }
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing unavailable", "Sharing is not available on this device.");
      return;
    }
    await Sharing.shareAsync(pdfUri);
  };

  if (!invoice) {
    return (
      <Screen>
        <Text>Invoice not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text fontSize="$7" fontWeight="700">
        Invoice #{invoice.number}
      </Text>

      <Card padding="$3" backgroundColor="$gray2">
        <YStack gap="$2">
          <Text>Issue date: {formatDateISO(invoice.issueDateISO)}</Text>
          <Text>
            Period: {formatDateISO(invoice.periodStartISO)} -{" "}
            {formatDateISO(invoice.periodEndISO)}
          </Text>
          <Text>Subtotal: {formatCurrency(invoice.subtotal)}</Text>
          <Text>GST: {formatCurrency(invoice.gstAmount)}</Text>
          <Text fontWeight="700">Total: {formatCurrency(invoice.total)}</Text>
        </YStack>
      </Card>

      <YStack gap="$2">
        {invoice.items.map((item) => (
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

      <Button onPress={handleGenerate}>Regenerate PDF</Button>
      <Button onPress={handleShare}>Share PDF</Button>
    </Screen>
  );
};

export default InvoiceDetail;
