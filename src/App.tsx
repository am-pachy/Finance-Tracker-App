import React, { useEffect, useMemo, useState } from "react";

type Lang = "it" | "en";
type Theme = "light" | "dark";
type Tab = "dashboard" | "movements" | "trips" | "forecast";
type MovementType = "spesa" | "entrata";

type Movement = {
  id: number;
  data: string;
  descrizione: string;
  categoria: string;
  tipo: MovementType;
  importo: number;
  necessaria: boolean;
  nota: string;
};

type Refund = {
  id: number;
  persona: string;
  motivo: string;
  importo: number;
  ricevuto: boolean;
};

type Trip = {
  id: number;
  viaggio: string;
  voce: string;
  importo: number;
  dataAddebito: string;
};

type Subscription = {
  id: number;
  nome: string;
  importo: number;
};

type AppData = {
  saldoAttuale: number;
  stipendioMedio: number;
  giornoStipendio: number;
  obiettivo: number;
  sogliaSicurezza: number;
  abbonamenti: Subscription[];
  movimenti: Movement[];
  rimborsi: Refund[];
  viaggi: Trip[];
};

type ForecastRow = {
  key: string;
  label: string;
  short: string;
  start: number;
  salary: number;
  movementExpenses: number;
  movementIncome: number;
  tripExpenses: number;
  subscriptions: number;
  refunds: number;
  final: number;
  margin: number;
};

const translations = {
  it: {
    appName: "Finanze",
    subtitle: "Budget personale, viaggi e previsione saldo",
    dashboard: "Dashboard",
    movements: "Movimenti",
    trips: "Viaggi",
    forecast: "Previsione",
    balance: "Saldo attuale",
    goal: "Obiettivo",
    progressGoal: "Progresso verso obiettivo",
    currentMonth: "Mese corrente",
    monthlyExpenses: "Spese del mese",
    subscriptions: "Abbonamenti",
    expectedRefunds: "Rimborsi attesi",
    addQuickExpense: "Aggiungi spesa veloce",
    quickPlaceholder: "pizza",
    add: "Aggiungi",
    recentMovements: "Movimenti recenti",
    addMovement: "Aggiungi movimento",
    description: "Descrizione",
    category: "Categoria",
    type: "Tipo",
    expense: "Spesa",
    income: "Entrata",
    amount: "Importo",
    note: "Nota",
    optionalNotes: "Note facoltative",
    date: "Data",
    save: "Salva",
    tripsTitle: "Addebiti viaggi",
    addTrip: "Aggiungi viaggio",
    tripName: "Viaggio",
    tripItem: "Voce",
    chargeDate: "Data addebito",
    monthlyForecast: "Previsione mensile",
    salary: "Stipendio medio",
    safetyThreshold: "Soglia sicurezza",
    finalBalance: "Saldo finale",
    month: "Mese",
    startBalance: "Saldo iniziale",
    tripExpenses: "Viaggi",
    normalExpenses: "Spese ordinarie",
    margin: "Margine",
    safe: "Sicuro",
    risk: "Rischio",
    refund: "Rimborsi",
    received: "Ricevuto",
    pending: "Da ricevere",
    totalTrips: "Totale viaggi",
    reset: "Reset dati",
    necessary: "Necessaria",
    notNecessary: "Non necessaria",
    total: "Totale",
    nextTrips: "Prossimi addebiti",
    monthlySaving: "Risparmio mensile necessario",
    light: "Chiaro",
    dark: "Scuro",
    theme: "Tema",
    currentMonthIncome: "Entrate del mese",
    currentMonthOut: "Uscite del mese",
    quickHint: "Es: pizza 18",
    noData: "Nessun dato",
    settings: "Impostazioni",
    currentBalance: "Saldo iniziale",
    targetGoal: "Obiettivo risparmio",
    avgSalary: "Stipendio medio",
    salaryDay: "Giorno stipendio",
    saveSettings: "Salva impostazioni",
    expensesByCategory: "Spese per categoria",
    noExpenseData: "Nessuna spesa da mostrare",
    helpMiniTitle: "Come usare l'app",
    helpMini1: "Inserisci saldo iniziale, stipendio e obiettivo.",
    helpMini2: "Aggiungi spese rapide scrivendo ad esempio: pizza 18.",
    helpMini3: "Aggiungi viaggi e controlla la previsione del saldo.",
  },
  en: {
    appName: "Finance",
    subtitle: "Personal budget, trips and balance forecast",
    dashboard: "Dashboard",
    movements: "Transactions",
    trips: "Trips",
    forecast: "Forecast",
    balance: "Current balance",
    goal: "Goal",
    progressGoal: "Progress to goal",
    currentMonth: "Current month",
    monthlyExpenses: "Monthly expenses",
    subscriptions: "Subscriptions",
    expectedRefunds: "Expected refunds",
    addQuickExpense: "Quick add expense",
    quickPlaceholder: "pizza",
    add: "Add",
    recentMovements: "Recent transactions",
    addMovement: "Add transaction",
    description: "Description",
    category: "Category",
    type: "Type",
    expense: "Expense",
    income: "Income",
    amount: "Amount",
    note: "Note",
    optionalNotes: "Optional notes",
    date: "Date",
    save: "Save",
    tripsTitle: "Trip charges",
    addTrip: "Add trip",
    tripName: "Trip",
    tripItem: "Item",
    chargeDate: "Charge date",
    monthlyForecast: "Monthly forecast",
    salary: "Average salary",
    safetyThreshold: "Safety threshold",
    finalBalance: "Final balance",
    month: "Month",
    startBalance: "Starting balance",
    tripExpenses: "Trips",
    normalExpenses: "Regular expenses",
    margin: "Margin",
    safe: "Safe",
    risk: "Risk",
    refund: "Refunds",
    received: "Received",
    pending: "Pending",
    totalTrips: "Total trips",
    reset: "Reset data",
    necessary: "Necessary",
    notNecessary: "Not necessary",
    total: "Total",
    nextTrips: "Upcoming charges",
    monthlySaving: "Monthly saving needed",
    light: "Light",
    dark: "Dark",
    theme: "Theme",
    currentMonthIncome: "Current month income",
    currentMonthOut: "Current month outflows",
    quickHint: "Ex: pizza 18",
    noData: "No data",
    settings: "Settings",
    currentBalance: "Starting balance",
    targetGoal: "Savings goal",
    avgSalary: "Average salary",
    salaryDay: "Salary day",
    saveSettings: "Save settings",
    expensesByCategory: "Expenses by category",
    noExpenseData: "No expenses to show",
    helpMiniTitle: "How to use the app",
    helpMini1: "Enter starting balance, average salary and savings goal.",
    helpMini2: "Add quick expenses by typing for example: pizza 18.",
    helpMini3: "Add trips and check the future balance forecast.",
  },
} as const;

const initialData: AppData = {
  saldoAttuale: 0,
  stipendioMedio: 0,
  giornoStipendio: 10,
  obiettivo: 6000,
  sogliaSicurezza: 1000,
  abbonamenti: [],
  movimenti: [],
  rimborsi: [],
  viaggi: [],
};

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "it";
  return navigator.language?.startsWith("it") ? "it" : "en";
}

function detectTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("fin-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

function getMonthKey(dateString: string): string {
  return String(dateString).slice(0, 7);
}

function formatDate(dateString: string, lang: Lang): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function detectCategory(text: string): string {
  const t = text.toLowerCase();

  if (
    t.includes("pizza") ||
    t.includes("ristorante") ||
    t.includes("bar") ||
    t.includes("cena") ||
    t.includes("pranzo") ||
    t.includes("colazione") ||
    t.includes("food") ||
    t.includes("groceries") ||
    t.includes("supermercato")
  ) {
    return "Food";
  }

  if (
    t.includes("uber") ||
    t.includes("taxi") ||
    t.includes("bus") ||
    t.includes("treno") ||
    t.includes("metro") ||
    t.includes("benzina") ||
    t.includes("carburante")
  ) {
    return "Trasporti";
  }

  if (
    t.includes("netflix") ||
    t.includes("spotify") ||
    t.includes("chatgpt") ||
    t.includes("subscription")
  ) {
    return "Abbonamenti";
  }

  return "Varie";
}

function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("fin-lang");
    return saved === "it" || saved === "en" ? saved : detectLang();
  });

  const [theme, setTheme] = useState<Theme>(detectTheme);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showSettings, setShowSettings] = useState(false);

  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem("fin-data-ts");
    return saved ? (JSON.parse(saved) as AppData) : initialData;
  });

  const [quickInput, setQuickInput] = useState("");
  const [quickNote, setQuickNote] = useState("");

  const [settingsDraft, setSettingsDraft] = useState({
    saldoAttuale: "",
    stipendioMedio: "",
    giornoStipendio: "10",
    obiettivo: "6000",
  });

  const [newMovement, setNewMovement] = useState({
    data: new Date().toISOString().slice(0, 10),
    descrizione: "",
    categoria: "Varie",
    tipo: "spesa" as MovementType,
    importo: "",
    necessaria: true,
    nota: "",
  });

  const [newTrip, setNewTrip] = useState({
    viaggio: "",
    voce: "",
    importo: "",
    dataAddebito: "",
  });

  const tr = translations[lang];

  useEffect(() => {
    localStorage.setItem("fin-lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("fin-data-ts", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("fin-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    setSettingsDraft({
      saldoAttuale: String(data.saldoAttuale || ""),
      stipendioMedio: String(data.stipendioMedio || ""),
      giornoStipendio: String(data.giornoStipendio || 10),
      obiettivo: String(data.obiettivo || 6000),
    });
  }, [data.saldoAttuale, data.stipendioMedio, data.giornoStipendio, data.obiettivo]);

  const totalSubscriptions = useMemo(
    () => data.abbonamenti.reduce((sum, item) => sum + item.importo, 0),
    [data.abbonamenti]
  );

  const totalRefunds = useMemo(
    () => data.rimborsi.filter((r) => !r.ricevuto).reduce((sum, r) => sum + r.importo, 0),
    [data.rimborsi]
  );

  const totalTrips = useMemo(
    () => data.viaggi.reduce((sum, trip) => sum + trip.importo, 0),
    [data.viaggi]
  );

  const totalExpenses = useMemo(
    () => data.movimenti.filter((m) => m.tipo === "spesa").reduce((sum, m) => sum + m.importo, 0),
    [data.movimenti]
  );

  const totalIncome = useMemo(
    () => data.movimenti.filter((m) => m.tipo === "entrata").reduce((sum, m) => sum + m.importo, 0),
    [data.movimenti]
  );

  const netEstimatedBalance = useMemo(() => {
    return data.saldoAttuale + totalIncome - totalExpenses + totalRefunds - totalTrips;
  }, [data.saldoAttuale, totalIncome, totalExpenses, totalRefunds, totalTrips]);

  const gap = Math.max(0, data.obiettivo - netEstimatedBalance);
  const monthlySavingNeeded = gap / 6;

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const currentMonthExpenses = useMemo(
    () =>
      data.movimenti
        .filter((m) => getMonthKey(m.data) === currentMonthKey && m.tipo === "spesa")
        .reduce((sum, m) => sum + m.importo, 0),
    [data.movimenti, currentMonthKey]
  );

  const currentMonthIncome = useMemo(
    () =>
      data.movimenti
        .filter((m) => getMonthKey(m.data) === currentMonthKey && m.tipo === "entrata")
        .reduce((sum, m) => sum + m.importo, 0),
    [data.movimenti, currentMonthKey]
  );

  const currentMonthOut = currentMonthExpenses + totalSubscriptions;

  const forecastRows = useMemo<ForecastRow[]>(() => {
    const baseMonth = new Date();
    let running = data.saldoAttuale;

    return Array.from({ length: 12 }).map((_, index) => {
      const d = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + index, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      const movementExpenses = data.movimenti
        .filter((m) => getMonthKey(m.data) === key && m.tipo === "spesa")
        .reduce((sum, m) => sum + m.importo, 0);

      const movementIncome = data.movimenti
        .filter((m) => getMonthKey(m.data) === key && m.tipo === "entrata")
        .reduce((sum, m) => sum + m.importo, 0);

      const tripExpenses = data.viaggi
        .filter((v) => getMonthKey(v.dataAddebito) === key)
        .reduce((sum, v) => sum + v.importo, 0);

      const refunds =
        index === 0
          ? data.rimborsi.filter((r) => !r.ricevuto).reduce((sum, r) => sum + r.importo, 0)
          : 0;

      const start = running;
      const salary = data.stipendioMedio;

      running =
        running +
        salary +
        movementIncome +
        refunds -
        movementExpenses -
        tripExpenses -
        totalSubscriptions;

      const monthName = new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-GB", {
        month: "long",
        year: "numeric",
      }).format(d);

      const short = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d);

      return {
        key,
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        short,
        start,
        salary,
        movementExpenses,
        movementIncome,
        tripExpenses,
        subscriptions: totalSubscriptions,
        refunds,
        final: running,
        margin: running - data.sogliaSicurezza,
      };
    });
  }, [data, lang, totalSubscriptions]);

  const progress = Math.min(
    100,
    Math.max(0, data.obiettivo > 0 ? (data.saldoAttuale / data.obiettivo) * 100 : 0)
  );

  const upcomingTrips = useMemo(
    () =>
      [...data.viaggi]
        .sort((a, b) => +new Date(a.dataAddebito) - +new Date(b.dataAddebito))
        .slice(0, 4),
    [data.viaggi]
  );

  function parseQuickExpense(text: string): { descrizione: string; importo: number } | null {
    const cleaned = text.trim();
    if (!cleaned) return null;

    const parts = cleaned.split(" ");
    const last = parts[parts.length - 1]?.replace(",", ".");
    const amount = Number(last);

    if (!amount || parts.length < 2) return null;

    return {
      descrizione: parts.slice(0, -1).join(" "),
      importo: amount,
    };
  }

  function handleQuickExpense(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseQuickExpense(quickInput);

    if (!parsed) {
      alert(
        lang === "it"
          ? "Inserisci anche l'importo. Es: pizza 18"
          : "Please add an amount too. Ex: pizza 18"
      );
      return;
    }

    const movement: Movement = {
      id: Date.now(),
      data: new Date().toISOString().slice(0, 10),
      descrizione: parsed.descrizione,
      categoria: detectCategory(parsed.descrizione),
      tipo: "spesa",
      importo: parsed.importo,
      necessaria: false,
      nota: quickNote.trim(),
    };

    setData((prev) => ({
      ...prev,
      movimenti: [movement, ...prev.movimenti],
    }));

    setQuickInput("");
    setQuickNote("");
  }

  function addMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!newMovement.descrizione || !newMovement.importo) return;

    const movement: Movement = {
      id: Date.now(),
      data: newMovement.data,
      descrizione: newMovement.descrizione,
      categoria: newMovement.categoria,
      tipo: newMovement.tipo,
      importo: Number(newMovement.importo),
      necessaria: newMovement.necessaria,
      nota: newMovement.nota,
    };

    setData((prev) => ({
      ...prev,
      movimenti: [movement, ...prev.movimenti],
    }));

    setNewMovement({
      data: new Date().toISOString().slice(0, 10),
      descrizione: "",
      categoria: "Varie",
      tipo: "spesa",
      importo: "",
      necessaria: true,
      nota: "",
    });
  }

  function addTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!newTrip.viaggio || !newTrip.voce || !newTrip.importo || !newTrip.dataAddebito) return;

    const trip: Trip = {
      id: Date.now(),
      viaggio: newTrip.viaggio,
      voce: newTrip.voce,
      importo: Number(newTrip.importo),
      dataAddebito: newTrip.dataAddebito,
    };

    setData((prev) => ({
      ...prev,
      viaggi: [...prev.viaggi, trip],
    }));

    setNewTrip({
      viaggio: "",
      voce: "",
      importo: "",
      dataAddebito: "",
    });
  }

  function toggleRefund(id: number) {
    setData((prev) => ({
      ...prev,
      rimborsi: prev.rimborsi.map((r) =>
        r.id === id ? { ...r, ricevuto: !r.ricevuto } : r
      ),
    }));
  }

  function saveSettings(e: React.FormEvent) {
    e.preventDefault();

    setData((prev) => ({
      ...prev,
      saldoAttuale: Number(settingsDraft.saldoAttuale || 0),
      stipendioMedio: Number(settingsDraft.stipendioMedio || 0),
      giornoStipendio: Number(settingsDraft.giornoStipendio || 10),
      obiettivo: Number(settingsDraft.obiettivo || 6000),
    }));

    setShowSettings(false);
  }

  function resetAll() {
    localStorage.removeItem("fin-data-ts");
    setData(initialData);
  }

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="topbar">
          <div>
            <h1 className="page-title">{tr.appName}</h1>
            <p className="page-subtitle">{tr.subtitle}</p>
          </div>

          <div className="topbar-actions">
            <button className="chip" onClick={() => setShowSettings(true)}>
              ⚙️
            </button>
            <button
              className={`chip ${lang === "it" ? "chip-active" : ""}`}
              onClick={() => setLang("it")}
            >
              IT
            </button>
            <button
              className={`chip ${lang === "en" ? "chip-active" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              className="chip"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {tr.theme}: {theme === "dark" ? tr.light : tr.dark}
            </button>
            <button className="chip" onClick={resetAll}>
              {tr.reset}
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="section-title">{tr.settings}</h2>
                <button className="modal-close" onClick={() => setShowSettings(false)}>
                  ✕
                </button>
              </div>

              <form className="form-grid-4" onSubmit={saveSettings}>
                <Field label={tr.currentBalance}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={settingsDraft.saldoAttuale}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, saldoAttuale: e.target.value }))
                    }
                  />
                </Field>

                <Field label={tr.avgSalary}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={settingsDraft.stipendioMedio}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, stipendioMedio: e.target.value }))
                    }
                  />
                </Field>

                <Field label={tr.salaryDay}>
                  <input
                    className="input"
                    type="number"
                    value={settingsDraft.giornoStipendio}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, giornoStipendio: e.target.value }))
                    }
                  />
                </Field>

                <Field label={tr.targetGoal}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={settingsDraft.obiettivo}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, obiettivo: e.target.value }))
                    }
                  />
                </Field>

                <div className="form-grid-full">
                  <button className="primary-btn" type="submit">
                    {tr.saveSettings}
                  </button>
                </div>
              </form>

              <div className="settings-help">
                <h3 className="settings-help-title">{tr.helpMiniTitle}</h3>
                <ul className="settings-help-list">
                  <li>{tr.helpMini1}</li>
                  <li>{tr.helpMini2}</li>
                  <li>{tr.helpMini3}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "dashboard" && (
          <div className="stack">
            <div className="grid grid-4">
              <StatCard title={tr.balance} value={formatEuro(data.saldoAttuale)} />
              <StatCard title={tr.goal} value={formatEuro(data.obiettivo)} />
              <StatCard title={tr.expectedRefunds} value={formatEuro(totalRefunds)} />
              <StatCard title={tr.monthlySaving} value={formatEuro(monthlySavingNeeded)} />
            </div>

            <div className="grid grid-3">
              <Card className="span-2">
                <div className="row-between">
                  <div>
                    <h2 className="section-title">{tr.progressGoal}</h2>
                    <p className="muted">{formatEuro(data.obiettivo)}</p>
                  </div>
                  <span className="badge">{Math.round(progress)}%</span>
                </div>

                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>

                <div className="grid grid-3 small-gap top-gap">
                  <MiniCard title={tr.monthlyExpenses} value={formatEuro(totalExpenses)} />
                  <MiniCard title={tr.totalTrips} value={formatEuro(totalTrips)} />
                  <MiniCard title={tr.finalBalance} value={formatEuro(netEstimatedBalance)} />
                </div>
              </Card>

              <Card>
                <h2 className="section-title">{tr.refund}</h2>
                <div className="list">
                  {data.rimborsi.length === 0 && <div className="muted">{tr.noData}</div>}
                  {data.rimborsi.map((r) => (
                    <div key={r.id} className="list-item">
                      <div>
                        <div className="item-title">{r.persona}</div>
                        <div className="muted">{r.motivo}</div>
                      </div>
                      <div className="right">
                        <div className="item-amount">{formatEuro(r.importo)}</div>
                        <button
                          className={`status-btn ${r.ricevuto ? "status-green" : "status-amber"}`}
                          onClick={() => toggleRefund(r.id)}
                        >
                          {r.ricevuto ? tr.received : tr.pending}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid grid-3">
              <Card>
                <h2 className="section-title">{tr.currentMonth}</h2>
                <div className="mini-rows">
                  <MiniRow label={tr.currentMonthIncome} value={formatEuro(currentMonthIncome)} positive />
                  <MiniRow label={tr.monthlyExpenses} value={formatEuro(currentMonthExpenses)} />
                  <MiniRow label={tr.subscriptions} value={formatEuro(totalSubscriptions)} />
                  <MiniRow label={tr.currentMonthOut} value={formatEuro(currentMonthOut)} />
                </div>
              </Card>

              <Card className="span-2">
                <div className="row-between">
                  <h2 className="section-title">{tr.nextTrips}</h2>
                  <span className="badge">{formatEuro(totalTrips)}</span>
                </div>

                <div className="grid grid-2">
                  {upcomingTrips.length === 0 && <div className="muted">{tr.noData}</div>}
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="list-item">
                      <div>
                        <div className="item-title">{trip.viaggio}</div>
                        <div className="muted">{trip.voce}</div>
                        <div className="small-muted">{formatDate(trip.dataAddebito, lang)}</div>
                      </div>
                      <div className="item-amount">{formatEuro(trip.importo)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <h2 className="section-title">{tr.addQuickExpense}</h2>
              <form className="form-stack" onSubmit={handleQuickExpense}>
                <input
                  className="input"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder={tr.quickPlaceholder}
                />
                <input
                  className="input"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder={tr.optionalNotes}
                />
                <button className="primary-btn" type="submit">
                  {tr.add}
                </button>
              </form>
              <p className="small-muted top-gap-sm">{tr.quickHint}</p>
            </Card>

            <Card>
              <h2 className="section-title">{tr.expensesByCategory}</h2>
              <CategoryChart movements={data.movimenti} emptyText={tr.noExpenseData} />
            </Card>
          </div>
        )}

        {tab === "movements" && (
          <div className="grid grid-3">
            <Card>
              <h2 className="section-title">{tr.addMovement}</h2>

              <form className="form-stack" onSubmit={addMovement}>
                <Field label={tr.date}>
                  <input
                    className="input"
                    type="date"
                    value={newMovement.data}
                    onChange={(e) => setNewMovement((prev) => ({ ...prev, data: e.target.value }))}
                  />
                </Field>

                <Field label={tr.description}>
                  <input
                    className="input"
                    value={newMovement.descrizione}
                    onChange={(e) => setNewMovement((prev) => ({ ...prev, descrizione: e.target.value }))}
                  />
                </Field>

                <Field label={tr.category}>
                  <input
                    className="input"
                    value={newMovement.categoria}
                    onChange={(e) => setNewMovement((prev) => ({ ...prev, categoria: e.target.value }))}
                  />
                </Field>

                <Field label={tr.type}>
                  <select
                    className="input"
                    value={newMovement.tipo}
                    onChange={(e) =>
                      setNewMovement((prev) => ({
                        ...prev,
                        tipo: e.target.value as MovementType,
                      }))
                    }
                  >
                    <option value="spesa">{tr.expense}</option>
                    <option value="entrata">{tr.income}</option>
                  </select>
                </Field>

                <Field label={tr.amount}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={newMovement.importo}
                    onChange={(e) => setNewMovement((prev) => ({ ...prev, importo: e.target.value }))}
                  />
                </Field>

                <Field label={tr.note}>
                  <input
                    className="input"
                    value={newMovement.nota}
                    onChange={(e) => setNewMovement((prev) => ({ ...prev, nota: e.target.value }))}
                    placeholder={tr.optionalNotes}
                  />
                </Field>

                <button className="primary-btn" type="submit">
                  {tr.save}
                </button>
              </form>
            </Card>

            <Card className="span-2">
              <h2 className="section-title">{tr.recentMovements}</h2>

              <div className="list">
                {data.movimenti.length === 0 && <div className="muted">{tr.noData}</div>}

                {data.movimenti.map((m) => (
                  <div key={m.id} className="list-item">
                    <div>
                      <div className="item-title">{m.descrizione}</div>
                      <div className="muted">
                        {formatDate(m.data, lang)} · {m.categoria}
                      </div>
                      {m.nota ? <div className="small-muted">{m.nota}</div> : null}
                    </div>
                    <div className="right">
                      <div className={`item-amount ${m.tipo === "spesa" ? "amount-negative" : "amount-positive"}`}>
                        {m.tipo === "spesa" ? "-" : "+"}
                        {formatEuro(m.importo)}
                      </div>
                      <div className="small-muted">
                        {m.necessaria ? tr.necessary : tr.notNecessary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "trips" && (
          <div className="grid grid-3">
            <Card>
              <h2 className="section-title">{tr.addTrip}</h2>

              <form className="form-stack" onSubmit={addTrip}>
                <Field label={tr.tripName}>
                  <input
                    className="input"
                    value={newTrip.viaggio}
                    onChange={(e) => setNewTrip((prev) => ({ ...prev, viaggio: e.target.value }))}
                  />
                </Field>

                <Field label={tr.tripItem}>
                  <input
                    className="input"
                    value={newTrip.voce}
                    onChange={(e) => setNewTrip((prev) => ({ ...prev, voce: e.target.value }))}
                  />
                </Field>

                <Field label={tr.amount}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={newTrip.importo}
                    onChange={(e) => setNewTrip((prev) => ({ ...prev, importo: e.target.value }))}
                  />
                </Field>

                <Field label={tr.chargeDate}>
                  <input
                    className="input"
                    type="date"
                    value={newTrip.dataAddebito}
                    onChange={(e) => setNewTrip((prev) => ({ ...prev, dataAddebito: e.target.value }))}
                  />
                </Field>

                <button className="primary-btn" type="submit">
                  {tr.save}
                </button>
              </form>
            </Card>

            <Card className="span-2">
              <div className="row-between">
                <h2 className="section-title">{tr.tripsTitle}</h2>
                <span className="badge">
                  {tr.total}: {formatEuro(totalTrips)}
                </span>
              </div>

              <div className="grid grid-2">
                {data.viaggi.length === 0 && <div className="muted">{tr.noData}</div>}
                {data.viaggi.map((trip) => (
                  <div key={trip.id} className="list-item">
                    <div>
                      <div className="muted">{trip.viaggio}</div>
                      <div className="item-title">{trip.voce}</div>
                      <div className="small-muted">{formatDate(trip.dataAddebito, lang)}</div>
                    </div>
                    <div className="item-amount">{formatEuro(trip.importo)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "forecast" && (
          <div className="stack">
            <div className="grid grid-4">
              <StatCard title={tr.salary} value={formatEuro(data.stipendioMedio)} />
              <StatCard title={tr.safetyThreshold} value={formatEuro(data.sogliaSicurezza)} />
              <StatCard title={tr.subscriptions} value={formatEuro(totalSubscriptions)} />
              <StatCard title={tr.finalBalance} value={formatEuro(forecastRows[forecastRows.length - 1]?.final ?? 0)} />
            </div>

            <Card>
              <h2 className="section-title">{tr.monthlyForecast}</h2>
              <ForecastChart rows={forecastRows} />
            </Card>

            <Card>
              <div className="table-wrap">
                <table className="forecast-table">
                  <thead>
                    <tr>
                      <th>{tr.month}</th>
                      <th>{tr.startBalance}</th>
                      <th>{tr.salary}</th>
                      <th>{tr.normalExpenses}</th>
                      <th>{tr.tripExpenses}</th>
                      <th>{tr.subscriptions}</th>
                      <th>{tr.finalBalance}</th>
                      <th>{tr.margin}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.label}</td>
                        <td>{formatEuro(row.start)}</td>
                        <td className="amount-positive">+{formatEuro(row.salary)}</td>
                        <td className="amount-negative">-{formatEuro(row.movementExpenses)}</td>
                        <td className="amount-negative">-{formatEuro(row.tripExpenses)}</td>
                        <td className="amount-negative">-{formatEuro(row.subscriptions)}</td>
                        <td className="strong">{formatEuro(row.final)}</td>
                        <td>
                          <span className={`status-btn ${row.margin >= 0 ? "status-green" : "status-red"}`}>
                            {row.margin >= 0 ? tr.safe : tr.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        {[
          ["dashboard", tr.dashboard],
          ["movements", tr.movements],
          ["trips", tr.trips],
          ["forecast", tr.forecast],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`nav-btn ${tab === key ? "nav-btn-active" : ""}`}
            onClick={() => setTab(key as Tab)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <div className="muted">{title}</div>
      <div className="stat-value">{value}</div>
    </Card>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="mini-card">
      <div className="muted">{title}</div>
      <div className="mini-value">{value}</div>
    </div>
  );
}

function MiniRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="mini-row">
      <div className="muted">{label}</div>
      <div className={positive ? "amount-positive strong" : "strong"}>{value}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}

function ForecastChart({ rows }: { rows: ForecastRow[] }) {
  const width = 1200;
  const height = 280;
  const padding = 32;

  const values = rows.map((r) => r.final);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = Math.max(max - min, 1);

  const points = rows.map((row, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(rows.length - 1, 1);
    const y = height - padding - ((row.final - min) / range) * (height - padding * 2);
    return { x, y, label: row.short, value: row.final };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="forecast chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="chart-axis" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="chart-axis" />

        {points.map((p) => (
          <g key={p.label}>
            <line x1={p.x} y1={padding} x2={p.x} y2={height - padding} className="chart-grid" />
            <text x={p.x} y={height - 10} textAnchor="middle" className="chart-label">
              {p.label}
            </text>
          </g>
        ))}

        <polyline fill="none" points={polylinePoints} className="chart-line" />

        {points.map((p) => (
          <g key={`${p.label}-dot`}>
            <circle cx={p.x} cy={p.y} r="5" className="chart-dot" />
            <text x={p.x} y={p.y - 12} textAnchor="middle" className="chart-value">
              {Math.round(p.value)}€
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CategoryChart({
  movements,
  emptyText,
}: {
  movements: Movement[];
  emptyText: string;
}) {
  const expenses = movements.filter((m) => m.tipo === "spesa");

  const grouped = expenses.reduce<Record<string, number>>((acc, m) => {
    const key = m.categoria || "Varie";
    acc[key] = (acc[key] || 0) + m.importo;
    return acc;
  }, {});

  const data = Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <div className="muted">{emptyText}</div>;
  }

  return (
    <div className="category-chart">
      {data.map((item) => (
        <div key={item.name} className="category-row">
          <div className="category-label-row">
            <span>{item.name}</span>
            <span>{formatEuro(item.value)}</span>
          </div>
          <div className="category-bar-track">
            <div
              className="category-bar-fill"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
