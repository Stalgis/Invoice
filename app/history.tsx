import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import Screen from "../components/Screen";
import { loadInvoices } from "../lib/storage/async";
import { formatCurrency, formatDateISO } from "../lib/dates";
import { InvoiceRecord } from "../types/models";

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  const loadData = useCallback(async () => {
    const stored = await loadInvoices();
    setInvoices(stored);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <Screen>
      <Text fontSize="$7" fontWeight="700">
        Invoice history
      </Text>

      <YStack gap="$3">
        {invoices.length === 0 ? (
          <Text color="$gray10">No invoices yet.</Text>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} padding="$3" backgroundColor="$gray2">
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text fontWeight="600">Invoice #{invoice.number}</Text>
                  <Text color="$gray10">
                    {formatDateISO(invoice.issueDateISO)} · {formatCurrency(invoice.total)}
                  </Text>
                  <Text color="$gray10">
                    {formatDateISO(invoice.periodStartISO)} - {formatDateISO(invoice.periodEndISO)}
                  </Text>
                </YStack>
                <Button
                  size="$2"
                  onPress={() => router.push(`/history/${invoice.id}`)}
                >
                  View
                </Button>
              </XStack>
            </Card>
          ))
        )}
      </YStack>
    </Screen>
  );
};

export default InvoiceHistory;
