export const toDateISO = (date: Date): string => {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = local.getFullYear();
  const month = `${local.getMonth() + 1}`.padStart(2, "0");
  const day = `${local.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateISO = (dateISO: string): Date => {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const startOfWeekMonday = (date: Date): Date => {
  const day = date.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const endOfWeekSunday = (date: Date): Date => {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const listWeekDays = (date: Date): Date[] => {
  const start = startOfWeekMonday(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
};

export const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

export const formatDateShort = (date: Date): string =>
  date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short"
  });

export const formatDateISO = (dateISO: string): string =>
  formatDate(parseDateISO(dateISO));

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD"
  }).format(amount);
