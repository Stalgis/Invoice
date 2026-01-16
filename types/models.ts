export type UserProfile = {
  fullName: string;
  email: string;
  address: string;
  phone: string;
  abn: string;
  hourlyRate: number;
};

export type WorkLogEntry = {
  id: string;
  dateISO: string;
  hours: number;
  description: string;
  createdAtISO: string;
  updatedAtISO: string;
};

export type InvoiceLineItem = {
  dateISO: string;
  description: string;
  hours: number;
  rate: number;
  lineTotal: number;
};

export type InvoiceRecord = {
  id: string;
  number: number;
  issueDateISO: string;
  periodStartISO: string;
  periodEndISO: string;
  items: InvoiceLineItem[];
  subtotal: number;
  gstIncluded: boolean;
  gstAmount: number;
  total: number;
  pdfUri?: string;
};

export type ReminderSettings = {
  enabled: boolean;
  time: string;
};
