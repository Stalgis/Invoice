import * as Print from "expo-print";
import { formatCurrency, formatDateISO } from "./dates";
import { InvoiceLineItem, InvoiceRecord, UserProfile, WorkLogEntry } from "../types/models";

export const buildInvoiceItems = (
  entries: Record<string, WorkLogEntry>,
  periodStartISO: string,
  periodEndISO: string,
  rate: number
): InvoiceLineItem[] => {
  return Object.values(entries)
    .filter(
      (entry) => entry.dateISO >= periodStartISO && entry.dateISO <= periodEndISO
    )
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .map((entry) => ({
      dateISO: entry.dateISO,
      description: entry.description,
      hours: entry.hours,
      rate,
      lineTotal: entry.hours * rate
    }));
};

export const calculateTotals = (
  items: InvoiceLineItem[],
  gstIncluded: boolean
): { subtotal: number; gstAmount: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const gstAmount = gstIncluded ? subtotal * 0.1 : 0;
  const total = subtotal + gstAmount;
  return { subtotal, gstAmount, total };
};

export const generateInvoiceHtml = (
  profile: UserProfile,
  record: InvoiceRecord
): string => {
  const rows = record.items
    .map(
      (item) => `
      <tr>
        <td>${formatDateISO(item.dateISO)}</td>
        <td>${item.description || "-"}</td>
        <td style="text-align:right;">${item.hours.toFixed(2)}</td>
        <td style="text-align:right;">${formatCurrency(item.rate)}</td>
        <td style="text-align:right;">${formatCurrency(item.lineTotal)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Arial, sans-serif; padding: 24px; color: #111; }
          h1 { margin-bottom: 4px; }
          .muted { color: #666; font-size: 12px; }
          .section { margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { text-align: left; background: #f4f4f4; }
          .totals { margin-top: 16px; width: 100%; }
          .totals td { border: none; }
        </style>
      </head>
      <body>
        <h1>Invoice #${record.number}</h1>
        <div class="muted">Issue date: ${formatDateISO(record.issueDateISO)}</div>
        <div class="muted">Period: ${formatDateISO(record.periodStartISO)} - ${formatDateISO(
          record.periodEndISO
        )}</div>

        <div class="section">
          <strong>${profile.fullName}</strong><br />
          ${profile.address}<br />
          ${profile.email} · ${profile.phone}<br />
          ABN: ${profile.abn}
        </div>

        <div class="section">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th style="text-align:right;">Hours</th>
                <th style="text-align:right;">Rate</th>
                <th style="text-align:right;">Line total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td style="text-align:right;">Subtotal:</td>
              <td style="text-align:right;">${formatCurrency(record.subtotal)}</td>
            </tr>
            <tr>
              <td style="text-align:right;">GST (10%):</td>
              <td style="text-align:right;">${formatCurrency(record.gstAmount)}</td>
            </tr>
            <tr>
              <td style="text-align:right; font-weight: bold;">Total:</td>
              <td style="text-align:right; font-weight: bold;">${formatCurrency(
                record.total
              )}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;
};

export const generateInvoicePdf = async (
  profile: UserProfile,
  record: InvoiceRecord
): Promise<string> => {
  const html = generateInvoiceHtml(profile, record);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
};
