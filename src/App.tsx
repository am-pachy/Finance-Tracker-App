import React, { useEffect, useMemo, useState } from "react";

type MovementType = "spesa" | "entrata";
type RecurrenceType = "una_tantum" | "fissa";
type Frequency =
  | ""
  | "giornaliera"
  | "mensile"
  | "trimestrale"
  | "semestrale"
  | "annuale";

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

type AppData = {
  saldoAttuale: number;
  stipendioMedio: number;
  giornoStipendio: number;
  obiettivo: number;
  dataObiettivo: string;
  sogliaSicurezza: number;
  movimenti: Movement[];
  viaggi: Trip[];
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
  }).format(value || 0);
}

function endOfCurrentMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
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

function monthDiff(startDate: Date, targetDate: Date) {
  return (
    (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
    (targetDate.getMonth() - startDate.getMonth())
  );
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

const initialData: AppData = {
  saldoAttuale: 0,
  stipendioMedio: 0,
  giornoStipendio: 10,
  obiettivo: 6000,
  dataObiettivo: endOfCurrentMonthISO(),
  sogliaSicurezza: 1000,
  movimenti: [],
  viaggi: [],
};

function App() {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem("fin-data");
    return saved ? JSON.parse(saved) : initialData;
  });

  const [settingsDraft, setSettingsDraft] = useState({
    saldoAttuale: "",
    stipendioMedio: "",
    giornoStipendio: "10",
    obiettivo: "6000",
    dataObiettivo: endOfCurrentMonthISO(),
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
    });
  }, [
    data.saldoAttuale,
    data.stipendioMedio,
    data.giornoStipendio,
    data.obiettivo,
    data.dataObiettivo,
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

  const saldoCalcolato = useMemo(() => {
    return data.saldoAttuale + totalIncome - totalExpenses;
  }, [data.saldoAttuale, totalIncome, totalExpenses]);

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

  const categoryTotals = useMemo(
    () => getCategoryTotals(data.movimenti),
    [data.movimenti]
  );

  const maxCategory = Math.max(...categoryTotals.map((c) => c.value), 1);

  const targetDate = useMemo(() => {
    const d = new Date(data.dataObiettivo || endOfCurrentMonthISO());
    return Number.isNaN(d.getTime()) ? new Date(endOfCurrentMonthISO()) : d;
  }, [data.dataObiettivo]);

  const monthsLeft = useMemo(() => {
    const start = new Date();
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const diff =
      (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
      (endMonth.getMonth() - startMonth.getMonth());
    return Math.max(1, diff + 1);
  }, [targetDate]);

  const gapToGoal = Math.max(0, data.obiettivo - saldoCalcolato);
  const monthlySavingNeeded = gapToGoal / Math.max(1, monthsLeft);
  const progress = Math.min(
    100,
    Math.max(0, data.obiettivo > 0 ? (saldoCalcolato / data.obiettivo) * 100 : 0)
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

  function saveSettings(e: React.FormEvent) {
    e.preventDefault();

    setData((prev) => ({
      ...prev,
      saldoAttuale: Number(settingsDraft.saldoAttuale || 0),
      stipendioMedio: Number(settingsDraft.stipendioMedio || 0),
      giornoStipendio: Number(settingsDraft.giornoStipendio || 10),
      obiettivo: Number(settingsDraft.obiettivo || 6000),
      dataObiettivo: settingsDraft.dataObiettivo || endOfCurrentMonthISO(),
    }));
  }

  function resetAll() {
    localStorage.removeItem("fin-data");
    setData(initialData);
  }

  const upcomingTrips = [...data.viaggi]
    .sort((a, b) => +new Date(a.dataAddebito) - +new Date(b.dataAddebito))
    .slice(0, 4);

  return (
    <div className="app-container">
      <div className="topbar">
        <div>
          <h1 className="page-title">Finanze</h1>
          <p className="page-subtitle">Budget personale e previsione spese</p>
        </div>
        <div className="topbar-actions">
          <button className="chip" onClick={resetAll}>
            Reset dati
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Impostazioni iniziali</h2>

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

          <div className="form-grid-full">
            <button className="primary-btn" type="submit">
              Salva impostazioni
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title">Dashboard</h2>

        <div className="grid grid-4">
          <StatCard title="Saldo attuale" value={formatEuro(saldoCalcolato)} />
          <StatCard title="Entrate" value={formatEuro(totalIncome)} />
          <StatCard title="Spese" value={formatEuro(totalExpenses)} />
          <StatCard title="Risparmio mensile necessario" value={formatEuro(monthlySavingNeeded)} />
        </div>

        <div className="grid grid-4 top-gap">
          <StatCard title="Obiettivo" value={formatEuro(data.obiettivo)} />
          <StatCard title="Gap all'obiettivo" value={formatEuro(gapToGoal)} />
          <StatCard title="Mesi rimanenti" value={String(monthsLeft)} />
          <StatCard title="Data obiettivo" value={formatDate(data.dataObiettivo)} />
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
          </div>
        </div>

        <div className="card span-2">
          <div className="row-between">
            <h2 className="section-title">Prossimi viaggi</h2>
            <span className="badge">{formatEuro(data.viaggi.reduce((s, v) => s + v.importo, 0))}</span>
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
          <h2 className="section-title">Movimenti recenti</h2>

          <div className="list">
            {data.movimenti.length === 0 && <div className="muted">Nessun movimento</div>}

            {data.movimenti.map((m) => (
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
          <h2 className="section-title">Spese per categoria</h2>

          {categoryTotals.length === 0 && <div className="muted">Nessuna spesa</div>}

          {categoryTotals.map((item) => (
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
                    width: `${(item.value / maxCategory) * 100}%`,
                    height: 8,
                    background: "var(--primary)",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
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

export default App;
