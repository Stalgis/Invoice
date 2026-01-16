import { useMemo, useState } from "react";

type DailyEntry = {
  id: number;
  date: string;
  hours: number;
  summary: string;
};

type Profile = {
  fullName: string;
  email: string;
  address: string;
  phone: string;
  abn: string;
  hourlyRate: string;
};

const initialProfile: Profile = {
  fullName: "Alex Johnson",
  email: "alex@email.com",
  address: "12 Market Street, Sydney",
  phone: "+61 400 000 000",
  abn: "12 345 678 901",
  hourlyRate: "$85.00",
};

const initialEntries: DailyEntry[] = [
  {
    id: 1,
    date: "2024-08-19",
    hours: 7.5,
    summary: "Homepage redesign and typography updates.",
  },
  {
    id: 2,
    date: "2024-08-20",
    hours: 8,
    summary: "Billing flow wireframes and client review.",
  },
  {
    id: 3,
    date: "2024-08-21",
    hours: 7,
    summary: "Invoice export UI and QA fixes.",
  },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);

const parseHourlyRate = (value: string) =>
  Number(value.replace(/[^0-9.]/g, "")) || 0;

export default function App() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [entries, setEntries] = useState<DailyEntry[]>(initialEntries);
  const [dailyEntry, setDailyEntry] = useState<DailyEntry>({
    id: 4,
    date: "",
    hours: 0,
    summary: "",
  });
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const hourlyRateValue = useMemo(
    () => parseHourlyRate(profile.hourlyRate),
    [profile.hourlyRate],
  );

  const weeklyTotalHours = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.hours, 0),
    [entries],
  );

  const weeklyTotalAmount = weeklyTotalHours * hourlyRateValue;

  const nextInvoiceNumber = useMemo(
    () => `#${String(entries.length + 21).padStart(5, "0")}`,
    [entries.length],
  );

  const handleProfileChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleEntryChange = (field: keyof DailyEntry, value: string) => {
    setDailyEntry((prev) => ({
      ...prev,
      [field]: field === "hours" ? Number(value) : value,
    }));
  };

  const addDailyEntry = () => {
    if (!dailyEntry.date || dailyEntry.hours <= 0) {
      return;
    }

    setEntries((prev) => [{ ...dailyEntry }, ...prev]);
    setDailyEntry({ id: dailyEntry.id + 1, date: "", hours: 0, summary: "" });
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Invoice Builder</p>
          <h1>Log daily hours and generate invoices from your phone.</h1>
          <p className="subhead">
            Save your client details once, get reminded to capture daily work,
            and generate a clean invoice whenever you need it.
          </p>
          <div className="hero-actions">
            <button className="primary">Generate invoice</button>
            <button
              className="ghost"
              onClick={() => setNotificationEnabled((prev) => !prev)}
            >
              {notificationEnabled
                ? "Daily reminder enabled"
                : "Enable daily reminder"}
            </button>
          </div>
        </div>
        <div className="hero-card">
          <h2>Weekly summary</h2>
          <ul>
            <li>
              <span>Total hours</span>
              <strong>{weeklyTotalHours.toFixed(1)} hrs</strong>
            </li>
            <li>
              <span>Hourly rate</span>
              <strong>{formatCurrency(hourlyRateValue)}</strong>
            </li>
            <li>
              <span>Invoice total</span>
              <strong>{formatCurrency(weeklyTotalAmount)}</strong>
            </li>
          </ul>
          <p className="helper">Invoice {nextInvoiceNumber} · Draft preview</p>
        </div>
      </header>

      <main>
        <section className="card">
          <div className="card-header">
            <h2>Encrypted profile details</h2>
            <p>These details are secured and appear on each invoice.</p>
          </div>
          <form className="grid-form">
            <label>
              Full name
              <input
                type="text"
                value={profile.fullName}
                onChange={(event) =>
                  handleProfileChange("fullName", event.target.value)
                }
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={profile.email}
                onChange={(event) =>
                  handleProfileChange("email", event.target.value)
                }
              />
            </label>
            <label>
              Address
              <input
                type="text"
                value={profile.address}
                onChange={(event) =>
                  handleProfileChange("address", event.target.value)
                }
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                value={profile.phone}
                onChange={(event) =>
                  handleProfileChange("phone", event.target.value)
                }
              />
            </label>
            <label>
              ABN
              <input
                type="text"
                value={profile.abn}
                onChange={(event) =>
                  handleProfileChange("abn", event.target.value)
                }
              />
            </label>
            <label>
              Hourly rate
              <input
                type="text"
                value={profile.hourlyRate}
                onChange={(event) =>
                  handleProfileChange("hourlyRate", event.target.value)
                }
              />
            </label>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span>Encrypt and store this profile</span>
            </label>
            <button type="button" className="primary">
              Save profile
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Daily hours log</h2>
            <p>Add the hours worked today and a quick summary.</p>
          </div>
          <form className="grid-form">
            <label>
              Date
              <input
                type="date"
                value={dailyEntry.date}
                onChange={(event) =>
                  handleEntryChange("date", event.target.value)
                }
              />
            </label>
            <label>
              Hours worked
              <input
                type="number"
                step="0.5"
                value={dailyEntry.hours || ""}
                onChange={(event) =>
                  handleEntryChange("hours", event.target.value)
                }
              />
            </label>
            <label className="full">
              Work completed
              <textarea
                rows={4}
                value={dailyEntry.summary}
                onChange={(event) =>
                  handleEntryChange("summary", event.target.value)
                }
              />
            </label>
            <button type="button" className="primary" onClick={addDailyEntry}>
              Add daily entry
            </button>
            <p className="success">Saved! You can edit entries later.</p>
          </form>
        </section>

        <section className="card invoice">
          <div className="card-header">
            <h2>Generated invoice preview</h2>
            <p>Review each day before exporting or sharing.</p>
          </div>
          <div className="invoice-grid">
            <div>
              <h3>Client details</h3>
              <p>{profile.fullName}</p>
              <p>{profile.address}</p>
              <p>
                {profile.email} · {profile.phone}
              </p>
              <p>ABN {profile.abn}</p>
            </div>
            <div>
              <h3>Invoice details</h3>
              <p>Invoice {nextInvoiceNumber}</p>
              <p>Created {new Date().toLocaleDateString("en-AU")}</p>
              <p>Hourly rate {formatCurrency(hourlyRateValue)}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Work summary</th>
                <th>Hours</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.date)}</td>
                  <td>{entry.summary}</td>
                  <td>{entry.hours.toFixed(1)}</td>
                  <td>{formatCurrency(entry.hours * hourlyRateValue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Weekly total</td>
                <td>{formatCurrency(weeklyTotalAmount)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="invoice-actions">
            <button className="ghost">Download PDF</button>
            <button
              className="primary"
              onClick={() => setNotificationEnabled((prev) => !prev)}
            >
              {notificationEnabled
                ? "Pause reminders"
                : "Enable reminders"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
