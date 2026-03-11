import React, { useEffect, useMemo, useState } from "react";

type Tab = "dashboard" | "movements" | "trips" | "shared" | "forecast";
type MovementType = "spesa" | "entrata";
type RecurrenceType = "una_tantum" | "fissa";
type Frequency =
  | ""
  | "giornaliera"
  | "mensile"
  | "trimestrale"
  | "semestrale"
  | "annuale";
type PersonKey = "first" | "second";

type Movement = {
  id: number;
  data: string;
  descrizione: string;
  categoria: string;
  tipo: MovementType;
  importo: number;
  necessaria: boolean;
  nota: string;
  ricorrenza: RecurrenceType;
  periodicita: Frequency;
  dataFine: string;
};

type Trip = {
  id: number;
  viaggio: string;
  voce: string;
  importo: number;
  dataAddebito: string;
};

type SharedExpense = {
  id: number;
  data: string;
  descrizione: string;
  importo: number;
  pagatoDa: PersonKey;
  divisoCon: PersonKey;
  quotaPercentuale: number;
  nota: string;
};

type AppData = {
  saldoAttuale: number;
  stipendioMedio: number;
  giornoStipendio: number;
  obiettivo: number;
  dataObiettivo: string;
  sogliaSicurezza: number;
  people: {
    first: string;
    second: string;
  };
  movimenti: Movement[];
  viaggi: Trip[];
  sharedExpenses: SharedExpense[];
};

type ForecastRow = {
  key: string;
  year: string;
  label: string;
  short: string;
  start: number;
  salary: number;
  movementExpenses: number;
  movementIncome: number;
  tripExpenses: number;
  sharedExpenses: number;
  final: number;
  margin: number;
};

const CATEGORY_OPTIONS = [
  "Casa",
  "Food",
  "Trasporti",
  "Abbonamenti",
  "Salute",
  "Tempo libero",
  "Shopping",
  "Viaggi",
  "Animali",
  "Altro",
] as const;

function formatEuro(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getMonthKey(dateString: string) {
  return String(dateString).slice(0, 7);
}

function endOfCurrentMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
}

function monthsBetweenInclusive(start: Date, end: Date) {
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  const diff =
    (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (endMonth.getMonth() - startMonth.getMonth());
  return Math.max(1, diff + 1);
}

function monthDiff(startDate: Date, targetDate: Date) {
  return (
    (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
    (targetDate.getMonth() - startDate.getMonth())
  );
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

  if (t.includes("archie") || t.includes("veterinario") || t.includes("crocchette")) {
    return "Animali";
  }

  if (t.includes("volo") || t.includes("hotel") || t.includes("airbnb")) {
    return "Viaggi";
  }

  return "Altro";
}

function occursInMonth(movement: Movement, monthDate: Date) {
  const base = new Date(movement.data);
  if (Number.isNaN(base.getTime())) return false;

  const targetStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const baseStart = new Date(base.getFullYear(), base.getMonth(), 1);

  if (targetStart < baseStart) return false;

  if (movement.dataFine) {
    const end = new Date(movement.dataFine);
    if (!Number.isNaN(end.getTime())) {
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      if (targetStart > endMonth) return false;
    }
  }

  if (movement.ricorrenza === "una_tantum") {
    return (
      movement.data.slice(0, 7) ===
      `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`
    );
  }

  const diff = monthDiff(baseStart, targetStart);

  switch (movement.periodicita) {
    case "giornaliera":
      return true;
    case "mensile":
      return diff >= 0;
    case "trimestrale":
      return diff >= 0 && diff % 3 === 0;
    case "semestrale":
      return diff >= 0 && diff % 6 === 0;
    case "annuale":
      return diff >= 0 && diff % 12 === 0;
    default:
      return false;
  }
}

function movementAmountForMonth(movement: Movement, monthDate: Date) {
  if (!occursInMonth(movement, monthDate)) return 0;

  if (movement.ricorrenza === "fissa" && movement.periodicita === "giornaliera") {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return movement.importo * lastDay;
  }

  return movement.importo;
}

function getCategoryTotals(movements: Movement[]) {
  const totals: Record<string, number> = {};

  movements
    .filter((m) => m.tipo === "spesa")
    .forEach((m) => {
      totals[m.categoria] = (totals[m.categoria] || 0) + m.importo;
    });

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function sharedImpactForFirstPerson(item: SharedExpense) {
  const quotaDivisoCon = (item.importo * item.quotaPercentuale) / 100;

  if (item.pagatoDa === "first" && item.divisoCon === "second") {
    return item.importo - quotaDivisoCon;
  }

  if (item.pagatoDa === "second" && item.divisoCon === "first") {
    return quotaDivisoCon;
  }

  return 0;
}

function sharedOccursInMonth(item: SharedExpense, monthDate: Date) {
  const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
  return item.data.slice(0, 7) === key;
}

const initialData: AppData = {
  saldoAttuale: 0,
  stipendioMedio: 0,
  giornoStipendio: 10,
  obiettivo: 6000,
  dataObiettivo: endOfCurrentMonthISO(),
  sogliaSicurezza: 1000,
  people: {
    first: "Persona 1",
    second: "Persona 2",
  },
  movimenti: [],
  viaggi: [],
  sharedExpenses: [],
};

function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [showSettings, setShowSettings] = useState(false);

  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem("fin-data");
    return saved ? (JSON.parse(saved) as AppData) : initialData;
  });

  const [settingsDraft, setSettingsDraft] = useState({
    saldoAttuale: "",
    stipendioMedio: "",
    giornoStipendio: "10",
    obiettivo: "6000",
    dataObiettivo: endOfCurrentMonthISO(),
    sogliaSicurezza: "1000",
    firstName: "",
    secondName: "",
  });

  const [quickInput, setQuickInput] = useState("");

  const [newMovement, setNewMovement] = useState({
    data: new Date().toISOString().slice(0, 10),
    descrizione: "",
    categoria: "Altro",
    tipo: "spesa" as MovementType,
    importo: "",
    nota: "",
    ricorrenza: "una_tantum" as RecurrenceType,
    periodicita: "" as Frequency,
    dataFine: "",
  });

  const [newTrip, setNewTrip] = useState({
    viaggio: "",
    voce: "",
    importo: "",
    dataAddebito: "",
  });

  const [newSharedExpense, setNewSharedExpense] = useState({
    data: new Date().toISOString().slice(0, 10),
    descrizione: "",
    importo: "",
    pagatoDa: "first" as PersonKey,
    divisoCon: "second" as PersonKey,
    quotaPercentuale: "50",
    nota: "",
  });

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [movementSearch, setMovementSearch] = useState("");
  const [movementYearFilter, setMovementYearFilter] = useState("all");
  const [forecastYearFilter, setForecastYearFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem("fin-data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    setSettingsDraft({
      saldoAttuale: String(data.saldoAttuale || ""),
      stipendioMedio: String(data.stipendioMedio || ""),
      giornoStipendio: String(data.giornoStipendio || 10),
      obiettivo: String(data.obiettivo || 6000),
      dataObiettivo: data.dataObiettivo || endOfCurrentMonthISO(),
      sogliaSicurezza: String(data.sogliaSicurezza || 1000),
      firstName: data.people.first,
      secondName: data.people.second,
    });
  }, [
    data.saldoAttuale,
    data.stipendioMedio,
    data.giornoStipendio,
    data.obiettivo,
    data.dataObiettivo,
    data.sogliaSicurezza,
    data.people.first,
    data.people.second,
  ]);

  const totalIncome = useMemo(
    () =>
      data.movimenti
        .filter((m) => m.tipo === "entrata")
        .reduce((sum, m) => sum + m.importo, 0),
    [data.movimenti]
  );

  const totalExpenses = useMemo(
    () =>
      data.movimenti
        .filter((m) => m.tipo === "spesa")
        .reduce((sum, m) => sum + m.importo, 0),
    [data.movimenti]
  );

  const totalSharedImpact = useMemo(
    () => data.sharedExpenses.reduce((sum, item) => sum + sharedImpactForFirstPerson(item), 0),
    [data.sharedExpenses]
  );

  const saldoCalcolato = useMemo(() => {
    return data.saldoAttuale + totalIncome - totalExpenses - totalSharedImpact;
  }, [data.saldoAttuale, totalIncome, totalExpenses, totalSharedImpact]);

  const currentMonthDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const currentMonthExpenses = useMemo(
    () =>
      data.movimenti
        .filter((m) => m.tipo === "spesa")
        .reduce((sum, m) => sum + movementAmountForMonth(m, currentMonthDate), 0),
    [data.movimenti]
  );

  const currentMonthIncome = useMemo(
    () =>
      data.movimenti
        .filter((m) => m.tipo === "entrata")
        .reduce((sum, m) => sum + movementAmountForMonth(m, currentMonthDate), 0),
    [data.movimenti]
  );

  const currentMonthSharedImpact = useMemo(
    () =>
      data.sharedExpenses.reduce((sum, item) => {
        if (!sharedOccursInMonth(item, currentMonthDate)) return sum;
        return sum + sharedImpactForFirstPerson(item);
      }, 0),
    [data.sharedExpenses]
  );

  const availableYears = useMemo(() => {
    const years = new Set<string>();

    data.movimenti.forEach((m) => {
      if (m.data) years.add(String(new Date(m.data).getFullYear()));
    });

    data.viaggi.forEach((v) => {
      if (v.dataAddebito) years.add(String(new Date(v.dataAddebito).getFullYear()));
    });

    data.sharedExpenses.forEach((s) => {
      if (s.data) years.add(String(new Date(s.data).getFullYear()));
    });

    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [data.movimenti, data.viaggi, data.sharedExpenses]);

  const filteredMovementsForDashboard = useMemo(() => {
    return data.movimenti.filter((m) => {
      const yearOk =
        selectedYear === "all" ||
        String(new Date(m.data).getFullYear()) === selectedYear;

      const categoryOk =
        selectedCategories.length === 0 ||
        selectedCategories.includes(m.categoria);

      return yearOk && categoryOk;
    });
  }, [data.movimenti, selectedYear, selectedCategories]);

  const filteredCategoryTotals = useMemo(
    () => getCategoryTotals(filteredMovementsForDashboard),
    [filteredMovementsForDashboard]
  );

  const filteredMaxCategory = Math.max(
    ...filteredCategoryTotals.map((c) => c.value),
    1
  );

  const filteredIncome = useMemo(
    () =>
      filteredMovementsForDashboard
        .filter((m) => m.tipo === "entrata")
        .reduce((sum, m) => sum + m.importo, 0),
    [filteredMovementsForDashboard]
  );

  const filteredExpenses = useMemo(
    () =>
      filteredMovementsForDashboard
        .filter((m) => m.tipo === "spesa")
        .reduce((sum, m) => sum + m.importo, 0),
    [filteredMovementsForDashboard]
  );

  const targetDate = useMemo(() => {
    const d = new Date(data.dataObiettivo || endOfCurrentMonthISO());
    return Number.isNaN(d.getTime()) ? new Date(endOfCurrentMonthISO()) : d;
  }, [data.dataObiettivo]);

  const monthsLeft = useMemo(
    () => monthsBetweenInclusive(new Date(), targetDate),
    [targetDate]
  );

  const gapToGoal = Math.max(0, data.obiettivo - saldoCalcolato);
  const monthlySavingNeeded = gapToGoal / Math.max(1, monthsLeft);

  const progress = Math.min(
    100,
    Math.max(0, data.obiettivo > 0 ? (saldoCalcolato / data.obiettivo) * 100 : 0)
  );

  const forecastRows = useMemo<ForecastRow[]>(() => {
    const baseMonth = new Date();
    let running = saldoCalcolato;

    return Array.from({ length: 12 }).map((_, index) => {
      const d = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + index, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      const movementExpenses = data.movimenti
        .filter((m) => m.tipo === "spesa")
        .reduce((sum, m) => sum + movementAmountForMonth(m, d), 0);

      const movementIncome = data.movimenti
        .filter((m) => m.tipo === "entrata")
        .reduce((sum, m) => sum + movementAmountForMonth(m, d), 0);

      const tripExpenses = data.viaggi
        .filter((v) => getMonthKey(v.dataAddebito) === key)
        .reduce((sum, v) => sum + v.importo, 0);

      const sharedExpenses = data.sharedExpenses.reduce((sum, item) => {
        if (!sharedOccursInMonth(item, d)) return sum;
        return sum + sharedImpactForFirstPerson(item);
      }, 0);

      const start = running;
      const salary = data.stipendioMedio;

      running =
        running +
        salary +
        movementIncome -
        movementExpenses -
        tripExpenses -
        sharedExpenses;

      const label = new Intl.DateTimeFormat("it-IT", {
        month: "long",
        year: "numeric",
      }).format(d);

      const short = new Intl.DateTimeFormat("it-IT", { month: "short" }).format(d);

      return {
        key,
        year: String(d.getFullYear()),
        label: label.charAt(0).toUpperCase() + label.slice(1),
        short,
        start,
        salary,
        movementExpenses,
        movementIncome,
        tripExpenses,
        sharedExpenses,
        final: running,
        margin: running - data.sogliaSicurezza,
      };
    });
  }, [data.movimenti, data.viaggi, data.sharedExpenses, data.stipendioMedio, data.sogliaSicurezza, saldoCalcolato]);

  const filteredForecastRows = useMemo(() => {
    return forecastRows.filter((row) => {
      return forecastYearFilter === "all" || row.year === forecastYearFilter;
    });
  }, [forecastRows, forecastYearFilter]);

  const filteredMovementsList = useMemo(() => {
    const query = movementSearch.trim().toLowerCase();

    return data.movimenti.filter((m) => {
      const yearOk =
        movementYearFilter === "all" ||
        String(new Date(m.data).getFullYear()) === movementYearFilter;

      const searchOk =
        query.length === 0 ||
        m.descrizione.toLowerCase().includes(query) ||
        m.categoria.toLowerCase().includes(query) ||
        m.nota.toLowerCase().includes(query);

      return yearOk && searchOk;
    });
  }, [data.movimenti, movementSearch, movementYearFilter]);

  const upcomingTrips = [...data.viaggi]
    .sort((a, b) => +new Date(a.dataAddebito) - +new Date(b.dataAddebito))
    .slice(0, 4);

  function toggleCategoryFilter(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }

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
      alert("Inserisci anche l'importo. Es: pizza 18");
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
      nota: "",
      ricorrenza: "una_tantum",
      periodicita: "",
      dataFine: "",
    };

    setData((prev) => ({
      ...prev,
      movimenti: [movement, ...prev.movimenti],
    }));

    setQuickInput("");
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
      necessaria: true,
      nota: newMovement.nota,
      ricorrenza: newMovement.ricorrenza,
      periodicita: newMovement.ricorrenza === "fissa" ? newMovement.periodicita : "",
      dataFine: newMovement.ricorrenza === "fissa" ? newMovement.dataFine : "",
    };

    setData((prev) => ({
      ...prev,
      movimenti: [movement, ...prev.movimenti],
    }));

    setNewMovement({
      data: new Date().toISOString().slice(0, 10),
      descrizione: "",
      categoria: "Altro",
      tipo: "spesa",
      importo: "",
      nota: "",
      ricorrenza: "una_tantum",
      periodicita: "",
      dataFine: "",
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
      viaggi: [trip, ...prev.viaggi],
    }));

    setNewTrip({
      viaggio: "",
      voce: "",
      importo: "",
      dataAddebito: "",
    });
  }

  function addSharedExpense(e: React.FormEvent) {
    e.preventDefault();

    if (!newSharedExpense.descrizione || !newSharedExpense.importo) return;
    if (newSharedExpense.pagatoDa === newSharedExpense.divisoCon) return;

    const item: SharedExpense = {
      id: Date.now(),
      data: newSharedExpense.data,
      descrizione: newSharedExpense.descrizione,
      importo: Number(newSharedExpense.importo),
      pagatoDa: newSharedExpense.pagatoDa,
      divisoCon: newSharedExpense.divisoCon,
      quotaPercentuale: Number(newSharedExpense.quotaPercentuale || 50),
      nota: newSharedExpense.nota,
    };

    setData((prev) => ({
      ...prev,
      sharedExpenses: [item, ...prev.sharedExpenses],
    }));

    setNewSharedExpense({
      data: new Date().toISOString().slice(0, 10),
      descrizione: "",
      importo: "",
      pagatoDa: "first",
      divisoCon: "second",
      quotaPercentuale: "50",
      nota: "",
    });
  }

  function saveSettings(e: React.FormEvent) {
    e.preventDefault();

    setData((prev) => ({
      ...prev,
      saldoAttuale: Number(settingsDraft.saldoAttuale || 0),
      stipendioMedio: Number(settingsDraft.stipendioMedio || 0),
      giornoStipendio: Number(settingsDraft.giornoStipendio || 10),
      obiettivo: Number(settingsDraft.obiettivo || 6000),
      dataObiettivo: settingsDraft.dataObiettivo || endOfCurrentMonthISO(),
      sogliaSicurezza: Number(settingsDraft.sogliaSicurezza || 1000),
      people: {
        first: settingsDraft.firstName.trim() || "Persona 1",
        second: settingsDraft.secondName.trim() || "Persona 2",
      },
    }));

    setShowSettings(false);
  }

  function resetAll() {
    localStorage.removeItem("fin-data");
    setData(initialData);
    setSelectedYear("all");
    setSelectedCategories([]);
    setMovementSearch("");
    setMovementYearFilter("all");
    setForecastYearFilter("all");
  }

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="topbar">
          <div>
            <h1 className="page-title">Finanze</h1>
            <p className="page-subtitle">Budget personale e previsione spese</p>
          </div>

          <div className="topbar-actions">
            <button className="chip" onClick={() => setShowSettings(true)}>
              ⚙️
            </button>
            <button className="chip" onClick={resetAll}>
              Reset dati
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="section-title">Impostazioni</h2>
                <button className="modal-close" onClick={() => setShowSettings(false)}>
                  ✕
                </button>
              </div>

              <form className="form-grid-4" onSubmit={saveSettings}>
                <div>
                  <label className="field-label">Saldo iniziale</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={settingsDraft.saldoAttuale}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, saldoAttuale: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Stipendio medio</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={settingsDraft.stipendioMedio}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, stipendioMedio: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Giorno stipendio</label>
                  <input
                    className="input"
                    type="number"
                    value={settingsDraft.giornoStipendio}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, giornoStipendio: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Obiettivo risparmio</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={settingsDraft.obiettivo}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, obiettivo: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Data obiettivo</label>
                  <input
                    className="input"
                    type="date"
                    value={settingsDraft.dataObiettivo}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, dataObiettivo: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Soglia sicurezza</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={settingsDraft.sogliaSicurezza}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, sogliaSicurezza: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Nome persona 1</label>
                  <input
                    className="input"
                    value={settingsDraft.firstName}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Nome persona 2</label>
                  <input
                    className="input"
                    value={settingsDraft.secondName}
                    onChange={(e) =>
                      setSettingsDraft((prev) => ({ ...prev, secondName: e.target.value }))
                    }
                  />
                </div>

                <div className="form-grid-full">
                  <button className="primary-btn" type="submit">
                    Salva impostazioni
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === "dashboard" && (
          <>
            <div className="card">
              <div className="row-between">
                <h2 className="section-title">Filtri dashboard</h2>
                <button
                  className="chip"
                  onClick={() => {
                    setSelectedYear("all");
                    setSelectedCategories([]);
                  }}
                >
                  Reset filtri
                </button>
              </div>

              <div className="grid grid-3">
                <div>
                  <label className="field-label">Anno</label>
                  <select
                    className="input"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="all">Tutti</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="span-2">
                  <label className="field-label">Categorie</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {CATEGORY_OPTIONS.map((category) => {
                      const active = selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          className={`chip ${active ? "chip-active" : ""}`}
                          onClick={() => toggleCategoryFilter(category)}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">Dashboard</h2>

              <div className="grid grid-4">
                <StatCard title="Saldo attuale" value={formatEuro(saldoCalcolato)} />
                <StatCard title="Entrate filtrate" value={formatEuro(filteredIncome)} />
                <StatCard title="Spese filtrate" value={formatEuro(filteredExpenses)} />
                <StatCard title="Gestione familiare" value={formatEuro(totalSharedImpact)} />
              </div>

              <div className="grid grid-4 top-gap">
                <StatCard title="Obiettivo" value={formatEuro(data.obiettivo)} />
                <StatCard title="Gap all'obiettivo" value={formatEuro(gapToGoal)} />
                <StatCard title="Mesi rimanenti" value={String(monthsLeft)} />
                <StatCard title="Risparmio mensile necessario" value={formatEuro(monthlySavingNeeded)} />
              </div>

              <div className="top-gap">
                <div className="row-between">
                  <div>
                    <h3 className="settings-help-title">Progresso verso obiettivo</h3>
                    <div className="muted">{formatEuro(data.obiettivo)}</div>
                  </div>
                  <span className="badge">{Math.round(progress)}%</span>
                </div>

                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-3">
              <div className="card">
                <h2 className="section-title">Mese corrente</h2>
                <div className="mini-rows">
                  <MiniRow label="Entrate del mese" value={formatEuro(currentMonthIncome)} positive />
                  <MiniRow label="Spese del mese" value={formatEuro(currentMonthExpenses)} />
                  <MiniRow label="Gestione familiare" value={formatEuro(currentMonthSharedImpact)} />
                </div>
              </div>

              <div className="card span-2">
                <div className="row-between">
                  <h2 className="section-title">Prossimi viaggi</h2>
                  <span className="badge">
                    {formatEuro(data.viaggi.reduce((s, v) => s + v.importo, 0))}
                  </span>
                </div>

                <div className="grid grid-2">
                  {upcomingTrips.length === 0 && <div className="muted">Nessun viaggio</div>}
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="list-item">
                      <div>
                        <div className="item-title">{trip.viaggio}</div>
                        <div className="muted">{trip.voce}</div>
                        <div className="small-muted">{formatDate(trip.dataAddebito)}</div>
                      </div>
                      <div className="item-amount">{formatEuro(trip.importo)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">Aggiungi spesa veloce</h2>
              <form className="form-stack" onSubmit={handleQuickExpense}>
                <input
                  className="input"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Es: pizza 18"
                />
                <button className="primary-btn" type="submit">
                  Aggiungi
                </button>
              </form>
            </div>

            <div className="card">
              <h2 className="section-title">Spese per categoria</h2>

              {filteredCategoryTotals.length === 0 && <div className="muted">Nessuna spesa</div>}

              {filteredCategoryTotals.map((item) => (
                <div key={item.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{item.name}</span>
                    <span>{formatEuro(item.value)}</span>
                  </div>

                  <div
                    style={{
                      height: 8,
                      background: "var(--bg-soft-2)",
                      borderRadius: 6,
                      marginTop: 4,
                      border: "1px solid var(--border)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.value / filteredMaxCategory) * 100}%`,
                        height: 8,
                        background: "var(--primary)",
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "movements" && (
          <div className="grid grid-3">
            <div className="card">
              <h2 className="section-title">Aggiungi movimento</h2>

              <form className="form-stack" onSubmit={addMovement}>
                <div>
                  <label className="field-label">Data</label>
                  <input
                    className="input"
                    type="date"
                    value={newMovement.data}
                    onChange={(e) =>
                      setNewMovement((prev) => ({ ...prev, data: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Descrizione</label>
                  <input
                    className="input"
                    value={newMovement.descrizione}
                    onChange={(e) =>
                      setNewMovement((prev) => ({ ...prev, descrizione: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Categoria</label>
                  <select
                    className="input"
                    value={newMovement.categoria}
                    onChange={(e) =>
                      setNewMovement((prev) => ({ ...prev, categoria: e.target.value }))
                    }
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label">Tipo</label>
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
                    <option value="spesa">Spesa</option>
                    <option value="entrata">Entrata</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Importo</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={newMovement.importo}
                    onChange={(e) =>
                      setNewMovement((prev) => ({ ...prev, importo: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Ricorrenza</label>
                  <select
                    className="input"
                    value={newMovement.ricorrenza}
                    onChange={(e) =>
                      setNewMovement((prev) => ({
                        ...prev,
                        ricorrenza: e.target.value as RecurrenceType,
                        periodicita: e.target.value === "fissa" ? prev.periodicita : "",
                        dataFine: e.target.value === "fissa" ? prev.dataFine : "",
                      }))
                    }
                  >
                    <option value="una_tantum">Una tantum</option>
                    <option value="fissa">Fissa</option>
                  </select>
                </div>

                {newMovement.ricorrenza === "fissa" && (
                  <>
                    <div>
                      <label className="field-label">Periodicità</label>
                      <select
                        className="input"
                        value={newMovement.periodicita}
                        onChange={(e) =>
                          setNewMovement((prev) => ({
                            ...prev,
                            periodicita: e.target.value as Frequency,
                          }))
                        }
                      >
                        <option value="">Seleziona</option>
                        <option value="giornaliera">Giornaliera</option>
                        <option value="mensile">Mensile</option>
                        <option value="trimestrale">Trimestrale</option>
                        <option value="semestrale">Semestrale</option>
                        <option value="annuale">Annuale</option>
                      </select>
                    </div>

                    <div>
                      <label className="field-label">Data fine (facoltativa)</label>
                      <input
                        className="input"
                        type="date"
                        value={newMovement.dataFine}
                        onChange={(e) =>
                          setNewMovement((prev) => ({ ...prev, dataFine: e.target.value }))
                        }
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="field-label">Note facoltative</label>
                  <input
                    className="input"
                    value={newMovement.nota}
                    onChange={(e) =>
                      setNewMovement((prev) => ({ ...prev, nota: e.target.value }))
                    }
                  />
                </div>

                <button className="primary-btn" type="submit">
                  Salva
                </button>
              </form>
            </div>

            <div className="card span-2">
              <div className="row-between">
                <h2 className="section-title">Movimenti recenti</h2>
                <button
                  className="chip"
                  onClick={() => {
                    setMovementSearch("");
                    setMovementYearFilter("all");
                  }}
                >
                  Reset filtri
                </button>
              </div>

              <div className="grid grid-2">
                <div>
                  <label className="field-label">Cerca descrizione / categoria / nota</label>
                  <input
                    className="input"
                    value={movementSearch}
                    onChange={(e) => setMovementSearch(e.target.value)}
                    placeholder="Es: pizza, netflix, casa..."
                  />
                </div>

                <div>
                  <label className="field-label">Anno</label>
                  <select
                    className="input"
                    value={movementYearFilter}
                    onChange={(e) => setMovementYearFilter(e.target.value)}
                  >
                    <option value="all">Tutti</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="list top-gap">
                {filteredMovementsList.length === 0 && <div className="muted">Nessun movimento</div>}

                {filteredMovementsList.map((m) => (
                  <div key={m.id} className="list-item">
                    <div>
                      <div className="item-title">{m.descrizione}</div>
                      <div className="muted">
                        {formatDate(m.data)} · {m.categoria}
                      </div>
                      {m.ricorrenza === "fissa" && (
                        <div className="small-muted">
                          Ricorrente · {m.periodicita || "periodicità non impostata"}
                        </div>
                      )}
                      {m.nota ? <div className="small-muted">{m.nota}</div> : null}
                    </div>

                    <div className="right">
                      <div
                        className={`item-amount ${
                          m.tipo === "spesa" ? "amount-negative" : "amount-positive"
                        }`}
                      >
                        {m.tipo === "spesa" ? "-" : "+"}
                        {formatEuro(m.importo)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "trips" && (
          <div className="grid grid-3">
            <div className="card">
              <h2 className="section-title">Aggiungi viaggio</h2>

              <form className="form-stack" onSubmit={addTrip}>
                <div>
                  <label className="field-label">Viaggio</label>
                  <input
                    className="input"
                    value={newTrip.viaggio}
                    onChange={(e) =>
                      setNewTrip((prev) => ({ ...prev, viaggio: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Voce</label>
                  <input
                    className="input"
                    value={newTrip.voce}
                    onChange={(e) =>
                      setNewTrip((prev) => ({ ...prev, voce: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Importo</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={newTrip.importo}
                    onChange={(e) =>
                      setNewTrip((prev) => ({ ...prev, importo: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Data addebito</label>
                  <input
                    className="input"
                    type="date"
                    value={newTrip.dataAddebito}
                    onChange={(e) =>
                      setNewTrip((prev) => ({ ...prev, dataAddebito: e.target.value }))
                    }
                  />
                </div>

                <button className="primary-btn" type="submit">
                  Salva
                </button>
              </form>
            </div>

            <div className="card span-2">
              <h2 className="section-title">Viaggi</h2>

              <div className="list">
                {data.viaggi.length === 0 && <div className="muted">Nessun viaggio</div>}

                {data.viaggi.map((trip) => (
                  <div key={trip.id} className="list-item">
                    <div>
                      <div className="item-title">{trip.viaggio}</div>
                      <div className="muted">{trip.voce}</div>
                      <div className="small-muted">{formatDate(trip.dataAddebito)}</div>
                    </div>

                    <div className="item-amount">{formatEuro(trip.importo)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "shared" && (
          <div className="grid grid-3">
            <div className="card">
              <h2 className="section-title">Aggiungi spesa condivisa</h2>

              <form className="form-stack" onSubmit={addSharedExpense}>
                <div>
                  <label className="field-label">Data</label>
                  <input
                    className="input"
                    type="date"
                    value={newSharedExpense.data}
                    onChange={(e) =>
                      setNewSharedExpense((prev) => ({ ...prev, data: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Descrizione</label>
                  <input
                    className="input"
                    value={newSharedExpense.descrizione}
                    onChange={(e) =>
                      setNewSharedExpense((prev) => ({ ...prev, descrizione: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Importo totale</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={newSharedExpense.importo}
                    onChange={(e) =>
                      setNewSharedExpense((prev) => ({ ...prev, importo: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Pagato da</label>
                  <select
                    className="input"
                    value={newSharedExpense.pagatoDa}
                    onChange={(e) =>
                      setNewSharedExpense((prev) => ({
                        ...prev,
                        pagatoDa: e.target.value as PersonKey,
                      }))
                    }
                  >
                    <option value="first">{data.people.first}</option>
                    <option value="second">{data.people.second}</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Diviso con</label>
                  <select
                    className="input"
                    value={newSharedExpense.divisoCon}
                    onChange={(e) =>
                      setNewSharedExpense((prev) => ({
                        ...prev,
                        divisoCon: e.target.value as PersonKey,
                      }))
                    }
                  >
                    <option value="first">{data.people.first}</option>
                    <option value="second">{data.people.second}</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Quota % a carico di chi deve restituire</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="100"
                    value={newSharedExpense.quotaPercentuale}
                    onChange={(e) =>
                      setNewSharedExpense((prev) => ({
                        ...prev,
                        quotaPercentuale: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="field-label">Nota</label>
                  <input
                    className="input"
                    value={newSharedExpense.nota}
                    onChange={(e) =>
                      setNewSharedExpense((prev) => ({ ...prev, nota: e.target.value }))
                    }
                  />
                </div>

                <button className="primary-btn" type="submit">
                  Salva
                </button>
              </form>
            </div>

            <div className="card span-2">
              <h2 className="section-title">Spese condivise</h2>

              <div className="list">
                {data.sharedExpenses.length === 0 && (
                  <div className="muted">Nessuna spesa condivisa</div>
                )}

                {data.sharedExpenses.map((item) => (
                  <div key={item.id} className="list-item">
                    <div>
                      <div className="item-title">{item.descrizione}</div>
                      <div className="muted">
                        {formatDate(item.data)} ·{" "}
                        {item.pagatoDa === "first" ? data.people.first : data.people.second} →{" "}
                        {item.divisoCon === "first" ? data.people.first : data.people.second}
                      </div>
                      <div className="small-muted">
                        Impatto sul tuo saldo: {formatEuro(sharedImpactForFirstPerson(item))}
                      </div>
                      {item.nota ? <div className="small-muted">{item.nota}</div> : null}
                    </div>

                    <div className="right">
                      <div className="item-amount">{formatEuro(item.importo)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "forecast" && (
          <div className="stack">
            <div className="card">
              <div className="row-between">
                <h2 className="section-title">Filtri previsione</h2>
                <button className="chip" onClick={() => setForecastYearFilter("all")}>
                  Reset filtri
                </button>
              </div>

              <div style={{ maxWidth: 240 }}>
                <label className="field-label">Anno</label>
                <select
                  className="input"
                  value={forecastYearFilter}
                  onChange={(e) => setForecastYearFilter(e.target.value)}
                >
                  <option value="all">Tutti</option>
                  {Array.from(new Set(forecastRows.map((row) => row.year))).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-4">
              <StatCard title="Saldo attuale" value={formatEuro(saldoCalcolato)} />
              <StatCard title="Obiettivo" value={formatEuro(data.obiettivo)} />
              <StatCard title="Gap all'obiettivo" value={formatEuro(gapToGoal)} />
              <StatCard title="Risparmio mensile necessario" value={formatEuro(monthlySavingNeeded)} />
            </div>

            <div className="card">
              <h2 className="section-title">Previsione finanziaria</h2>
              <ForecastChart rows={filteredForecastRows} />
            </div>

            <div className="card">
              <div className="table-wrap">
                <table className="forecast-table">
                  <thead>
                    <tr>
                      <th>Mese</th>
                      <th>Saldo iniziale</th>
                      <th>Stipendio</th>
                      <th>Entrate</th>
                      <th>Spese</th>
                      <th>Viaggi</th>
                      <th>Gestione familiare</th>
                      <th>Saldo finale</th>
                      <th>Margine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredForecastRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.label}</td>
                        <td>{formatEuro(row.start)}</td>
                        <td className="amount-positive">+{formatEuro(row.salary)}</td>
                        <td className="amount-positive">+{formatEuro(row.movementIncome)}</td>
                        <td className="amount-negative">-{formatEuro(row.movementExpenses)}</td>
                        <td className="amount-negative">-{formatEuro(row.tripExpenses)}</td>
                        <td className="amount-negative">-{formatEuro(row.sharedExpenses)}</td>
                        <td className="strong">{formatEuro(row.final)}</td>
                        <td>
                          <span className={`status-btn ${row.margin >= 0 ? "status-green" : "status-red"}`}>
                            {row.margin >= 0 ? "Sicuro" : "Rischio"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        <button
          className={`nav-btn ${tab === "dashboard" ? "nav-btn-active" : ""}`}
          onClick={() => setTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`nav-btn ${tab === "movements" ? "nav-btn-active" : ""}`}
          onClick={() => setTab("movements")}
        >
          Movimenti
        </button>
        <button
          className={`nav-btn ${tab === "trips" ? "nav-btn-active" : ""}`}
          onClick={() => setTab("trips")}
        >
          Viaggi
        </button>
        <button
          className={`nav-btn ${tab === "shared" ? "nav-btn-active" : ""}`}
          onClick={() => setTab("shared")}
        >
          Gestione familiare
        </button>
        <button
          className={`nav-btn ${tab === "forecast" ? "nav-btn-active" : ""}`}
          onClick={() => setTab("forecast")}
        >
          Previsioni
        </button>
      </nav>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
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

function ForecastChart({ rows }: { rows: ForecastRow[] }) {
  if (rows.length === 0) {
    return <div className="muted">Nessun dato da mostrare</div>;
  }

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

        <polyline points={polylinePoints} className="chart-line" />

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

export default App;
