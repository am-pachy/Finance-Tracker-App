import React, { useEffect, useMemo, useState } from 'react';
import {
  PlusCircle,
  Wallet,
  LayoutGrid,
  Sparkles,
  Search,
  User,
  Tag,
  Euro,
  Calendar,
  Home,
  Car,
  GraduationCap,
  Heart,
  Download,
  CheckCircle2,
  X,
  LogOut,
} from 'lucide-react';
import logo from './assets/golden-snake-logo.png';
import { supabase } from './supabaseClient';

type Screen = 'splash' | 'login' | 'app';
type MovimentoTipo = 'USCITA' | 'ENTRATA';
type DebitoTipo = 'RICEVERE' | 'DARE';

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  partner_name: string | null;
  savings_goal: number | null;
  goal_date: string | null;
  gender: string | null;
  custom_categories: string[] | null;
  fixed_expenses_setup: number | null;
};

type MovementRow = {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: MovimentoTipo;
  nature: string | null;
  category: string | null;
  created_at: string;
};

type DebtRow = {
  id: string;
  user_id: string;
  person_name: string;
  reason: string;
  amount: number;
  due_date: string | null;
  type: DebitoTipo;
  status: string | null;
  created_at: string;
};

type GoalRow = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
};

const APP_WIDTH = 480;
const SALDO_INIZIALE = 0;

const mesiOrdine = ['Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic', 'Gen', 'Feb'];
const mesiMappa: Record<number, string> = {
  0: 'Gen',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'Mag',
  5: 'Giu',
  6: 'Lug',
  7: 'Ago',
  8: 'Set',
  9: 'Ott',
  10: 'Nov',
  11: 'Dic',
};

const euroFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

function formatEuro(value: number) {
  return euroFormatter.format(value);
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F3F4F6',
    fontFamily: 'Inter, sans-serif',
  },
  shell: {
    width: '100%',
    maxWidth: `${APP_WIDTH}px`,
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflowX: 'hidden',
  },
  app: {
    minHeight: '100vh',
    paddingBottom: '120px',
  },
  header: {
    padding: '40px 25px 20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
    marginBottom: '16px',
  },
  darkCard: {
    backgroundColor: '#1E293B',
    color: 'white',
    padding: '30px 20px',
    borderRadius: '35px',
    textAlign: 'center',
    marginBottom: '25px',
  },
  input: {
    width: '100%',
    padding: '14px',
    borderRadius: '16px',
    border: '1.5px solid #F1F5F9',
    marginBottom: '10px',
    boxSizing: 'border-box',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: 'white',
  },
  labelIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '10px',
    color: '#94A3B8',
    fontWeight: '800',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  btn: {
    width: '100%',
    padding: '18px',
    borderRadius: '24px',
    border: 'none',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '16px',
  },
  btnPrimary: {
    width: '100%',
    padding: '18px',
    borderRadius: '24px',
    border: 'none',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '16px',
    backgroundColor: '#5DB386',
    marginTop: '10px',
  },
  toggleW: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    backgroundColor: '#F1F5F9',
    padding: '6px',
    borderRadius: '18px',
  },
  toggleB: {
    flex: 1,
    padding: '12px',
    borderRadius: '14px',
    border: 'none',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    background: 'transparent',
  },
  navWrap: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: `${APP_WIDTH}px`,
    padding: '0 20px',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  nav: {
    height: '75px',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    borderRadius: '40px',
    pointerEvents: 'auto',
  },
  navButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
  },
  catChip: {
    padding: '10px 18px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#F1F5F9',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  authPage: {
    minHeight: '100vh',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    justifyContent: 'center',
  },
  authInner: {
    width: '100%',
    maxWidth: `${APP_WIDTH}px`,
    minHeight: '100vh',
    padding: '36px 28px 50px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  authInput: {
    width: '100%',
    padding: '24px 28px',
    borderRadius: '28px',
    border: '4px solid #D7DCE5',
    backgroundColor: 'transparent',
    fontSize: '24px',
    color: '#334155',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '24px',
  },
  authBtn: {
    width: '100%',
    padding: '24px',
    borderRadius: '32px',
    border: 'none',
    backgroundColor: '#3B82F6',
    color: 'white',
    fontSize: '24px',
    fontWeight: 800,
    cursor: 'pointer',
    marginBottom: '34px',
  },
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      setSessionUserId(user?.id ?? null);
      setScreen(user ? 'app' : 'login');
    };

    boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setSessionUserId(user?.id ?? null);
      setScreen(user ? 'app' : 'login');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (screen === 'splash') return <SplashScreen />;
  if (screen === 'login') return <LoginScreen />;

  if (!sessionUserId) return <SplashScreen />;

  return <MainApp userId={sessionUserId} />;
}

function SplashScreen() {
  return (
    <div style={s.authPage}>
      <div
        style={{
          ...s.authInner,
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <img
          src={logo}
          alt="SalvadaNoi logo"
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'contain',
            marginBottom: '24px',
          }}
        />
        <h1 style={{ margin: 0, fontSize: '42px', fontWeight: 800, color: '#1E293B' }}>
          SalvadaNoi
        </h1>
        <p style={{ marginTop: '12px', color: '#64748B', fontSize: '20px' }}>
          Il vostro risparmio, insieme. 🐍
        </p>
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  const handleLogin = async () => {
    setErrore('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrore(error.message);
    }

    setLoading(false);
  };

  return (
    <div style={s.authPage}>
      <div style={s.authInner}>
        <img
          src={logo}
          alt="SalvadaNoi logo"
          style={{
            width: '210px',
            height: '210px',
            objectFit: 'contain',
            marginTop: '20px',
            marginBottom: '10px',
          }}
        />

        <h1
          style={{
            marginTop: 0,
            marginBottom: '8px',
            fontSize: '42px',
            fontWeight: 800,
            color: '#1E293B',
          }}
        >
          SalvadaNoi
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: '40px',
            fontSize: '18px',
            color: '#64748B',
            textAlign: 'center',
          }}
        >
          Il vostro risparmio, insieme. 🐍
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={s.authInput}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={s.authInput}
        />

        <button onClick={handleLogin} style={s.authBtn} disabled={loading}>
          {loading ? 'Accesso...' : 'Entra'}
        </button>

        {errore ? (
          <p style={{ color: '#DC2626', marginTop: '-12px', marginBottom: '18px', textAlign: 'center' }}>
            {errore}
          </p>
        ) : null}

        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#3B82F6',
            fontSize: '24px',
            cursor: 'pointer',
          }}
          onClick={() => alert('Per ora usiamo il login degli utenti già creati in Supabase.')}
        >
          Nuovo qui? Registrati
        </button>
      </div>
    </div>
  );
}

function MainApp({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('movimenti');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const caricaDati = async () => {
    setLoading(true);

    const [profileRes, movementsRes, debtsRes, goalsRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('movements').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('debts_credits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    if (!profileRes.error) setProfile((profileRes.data as UserProfile | null) ?? null);
    if (!movementsRes.error) setMovements((movementsRes.data as MovementRow[]) ?? []);
    if (!debtsRes.error) setDebts((debtsRes.data as DebtRow[]) ?? []);
    if (!goalsRes.error) setGoals((goalsRes.data as GoalRow[]) ?? []);

    setLoading(false);
  };

  useEffect(() => {
    caricaDati();
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const firstName = profile?.first_name || 'Anna';
  const partnerName = profile?.partner_name || 'Michele';

  return (
    <div style={s.page}>
      <div style={s.shell}>
        <div style={s.app}>
          <header style={s.header}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Ciao, {firstName}! 🐍</h2>
                <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#94A3B8' }}>Insieme a {partnerName}</p>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  border: 'none',
                  background: 'white',
                  borderRadius: '16px',
                  width: '44px',
                  height: '44px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={18} color="#64748B" />
              </button>
            </div>
          </header>

          <main style={{ padding: '0 20px' }}>
            {loading ? (
              <div style={s.card}>
                <p style={{ margin: 0, color: '#64748B' }}>Caricamento dati...</p>
              </div>
            ) : null}

            {!loading && activeTab === 'movimenti' && (
              <SezioneMovimenti userId={userId} onSaved={caricaDati} customCategories={profile?.custom_categories ?? []} />
            )}
            {!loading && activeTab === 'debiti' && (
              <SezioneDebiti userId={userId} debts={debts} onSaved={caricaDati} />
            )}
            {!loading && activeTab === 'saldo' && (
              <SezioneSaldoEPrevisioni movements={movements} saldoIniziale={SALDO_INIZIALE} />
            )}
            {!loading && activeTab === 'obiettivi' && (
              <SezioneObiettivi userId={userId} goals={goals} onSaved={caricaDati} />
            )}
          </main>
        </div>

        <div style={s.navWrap}>
          <nav style={s.nav}>
            <button onClick={() => setActiveTab('movimenti')} style={s.navButton}>
              <PlusCircle size={24} color={activeTab === 'movimenti' ? '#3B82F6' : '#94A3B8'} />
            </button>
            <button onClick={() => setActiveTab('debiti')} style={s.navButton}>
              <Wallet size={24} color={activeTab === 'debiti' ? '#5DB386' : '#94A3B8'} />
            </button>
            <button onClick={() => setActiveTab('saldo')} style={s.navButton}>
              <LayoutGrid size={24} color={activeTab === 'saldo' ? '#3B82F6' : '#94A3B8'} />
            </button>
            <button onClick={() => setActiveTab('obiettivi')} style={s.navButton}>
              <Sparkles size={24} color={activeTab === 'obiettivi' ? '#8B5CF6' : '#94A3B8'} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

function SezioneMovimenti({
  userId,
  onSaved,
  customCategories,
}: {
  userId: string;
  onSaved: () => Promise<void>;
  customCategories: string[];
}) {
  const [tipo, setTipo] = useState<MovimentoTipo>('USCITA');
  const [descrizione, setDescrizione] = useState('');
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('Casa');
  const [importo, setImporto] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [periodicita, setPeriodicita] = useState('Fissa (Ricorrente)');
  const [giornoMese, setGiornoMese] = useState('1');
  const [saving, setSaving] = useState(false);
  const [messaggio, setMessaggio] = useState('');

  const accent = tipo === 'USCITA' ? '#E15B51' : '#5DB386';

  const categorieBase = [
    { nome: 'Casa', icona: Home },
    { nome: 'Auto', icona: Car },
    { nome: 'Scuola', icona: GraduationCap },
    { nome: 'Animali', icona: Heart },
  ];

  const categorieExtra = customCategories
    .filter((cat) => !categorieBase.some((base) => base.nome === cat))
    .map((cat) => ({ nome: cat, icona: Tag }));

  const categorie = [...categorieBase, ...categorieExtra];

  const salvaMovimento = async () => {
    setMessaggio('');

    if (!descrizione.trim() || !importo.trim()) {
      setMessaggio('Compila almeno descrizione e importo.');
      return;
    }

    setSaving(true);

    const amountNumber = Number(importo.replace(',', '.'));

    const { error } = await supabase.from('movements').insert({
      user_id: userId,
      description: descrizione.trim(),
      amount: amountNumber,
      type: tipo,
      nature: periodicita,
      category: categoriaSelezionata,
      created_at: new Date(`${data}T12:00:00`).toISOString(),
    });

    if (error) {
      setMessaggio(error.message);
      setSaving(false);
      return;
    }

    setDescrizione('');
    setImporto('');
    setData(new Date().toISOString().slice(0, 10));
    setPeriodicita('Fissa (Ricorrente)');
    setGiornoMese('1');
    setMessaggio('Movimento salvato.');
    setSaving(false);
    await onSaved();
  };

  return (
    <div style={s.card}>
      <div style={s.toggleW}>
        <button
          onClick={() => setTipo('USCITA')}
          style={{
            ...s.toggleB,
            backgroundColor: tipo === 'USCITA' ? '#E15B51' : 'transparent',
            color: tipo === 'USCITA' ? 'white' : '#94A3B8',
          }}
        >
          USCITA
        </button>
        <button
          onClick={() => setTipo('ENTRATA')}
          style={{
            ...s.toggleB,
            backgroundColor: tipo === 'ENTRATA' ? '#5DB386' : 'transparent',
            color: tipo === 'ENTRATA' ? 'white' : '#94A3B8',
          }}
        >
          ENTRATA
        </button>
      </div>

      <label style={s.labelIcon}>DESCRIZIONE</label>
      <input
        style={s.input}
        placeholder={tipo === 'USCITA' ? 'es. Netflix, Pizza...' : 'es. Stipendio, Rimborso...'}
        value={descrizione}
        onChange={(e) => setDescrizione(e.target.value)}
      />

      <label style={s.labelIcon}>CATEGORIA</label>
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px' }}>
        {categorie.map(({ nome, icona: Icona }) => {
          const attiva = categoriaSelezionata === nome;

          return (
            <button
              key={nome}
              type="button"
              onClick={() => setCategoriaSelezionata(nome)}
              style={{
                ...s.catChip,
                backgroundColor: attiva ? '#3B82F6' : '#F1F5F9',
                color: attiva ? 'white' : '#334155',
              }}
            >
              <Icona size={14} />
              {nome}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={s.labelIcon}>IMPORTO</label>
          <input
            style={s.input}
            placeholder="€"
            value={importo}
            onChange={(e) => setImporto(e.target.value)}
          />
        </div>
        <div>
          <label style={s.labelIcon}>DATA {tipo === 'USCITA' ? 'ADDEBITO' : 'ACCREDITO'}</label>
          <input style={s.input} type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
      </div>

      <label style={s.labelIcon}>PERIODICITÀ</label>
      <select style={s.input} value={periodicita} onChange={(e) => setPeriodicita(e.target.value)}>
        <option>Fissa (Ricorrente)</option>
        <option>Singola</option>
      </select>

      <div
        style={{
          backgroundColor: '#F8FAFC',
          padding: '15px',
          borderRadius: '20px',
          border: '1px solid #F1F5F9',
        }}
      >
        <label style={s.labelIcon}>GIORNO DEL MESE (1-31)</label>
        <input
          style={{ ...s.input, marginBottom: 0 }}
          type="number"
          value={giornoMese}
          onChange={(e) => setGiornoMese(e.target.value)}
        />
      </div>

      <button
        style={{ ...s.btn, backgroundColor: accent, marginTop: '20px' }}
        onClick={salvaMovimento}
        disabled={saving}
      >
        {saving ? 'Salvataggio...' : `Salva ${tipo === 'USCITA' ? 'Uscita' : 'Entrata'}`}
      </button>

      {messaggio ? (
        <p style={{ marginTop: '12px', marginBottom: 0, color: messaggio.includes('salvato') ? '#16A34A' : '#DC2626' }}>
          {messaggio}
        </p>
      ) : null}
    </div>
  );
}

function SezioneDebiti({
  userId,
  debts,
  onSaved,
}: {
  userId: string;
  debts: DebtRow[];
  onSaved: () => Promise<void>;
}) {
  const [tipo, setTipo] = useState<DebitoTipo>('RICEVERE');
  const [persona, setPersona] = useState('');
  const [causale, setCausale] = useState('');
  const [importo, setImporto] = useState('');
  const [scadenza, setScadenza] = useState('');
  const [filtro, setFiltro] = useState('');
  const [saving, setSaving] = useState(false);
  const [messaggio, setMessaggio] = useState('');

  const totaleRicevi = debts
    .filter((d) => d.type === 'RICEVERE')
    .reduce((acc, d) => acc + Number(d.amount), 0);

  const totaleDevi = debts
    .filter((d) => d.type === 'DARE')
    .reduce((acc, d) => acc + Number(d.amount), 0);

  const saldoNetto = totaleRicevi - totaleDevi;

  const debitiFiltrati = debts.filter((d) =>
    d.person_name.toLowerCase().includes(filtro.toLowerCase())
  );

  const salvaDebito = async () => {
    setMessaggio('');

    if (!persona.trim() || !causale.trim() || !importo.trim()) {
      setMessaggio('Compila persona, causale e importo.');
      return;
    }

    setSaving(true);

    const amountNumber = Number(importo.replace(',', '.'));

    const { error } = await supabase.from('debts_credits').insert({
      user_id: userId,
      person_name: persona.trim(),
      reason: causale.trim(),
      amount: amountNumber,
      due_date: scadenza || null,
      type: tipo,
      status: 'APERTO',
    });

    if (error) {
      setMessaggio(error.message);
      setSaving(false);
      return;
    }

    setPersona('');
    setCausale('');
    setImporto('');
    setScadenza('');
    setMessaggio('Debito/credito salvato.');
    setSaving(false);
    await onSaved();
  };

  return (
    <div>
      <div style={s.darkCard}>
        <p style={{ fontSize: '10px', opacity: 0.6, fontWeight: '800' }}>SALDO NETTO</p>
        <h1 style={{ fontSize: '48px', margin: '5px 0', fontWeight: '800' }}>{formatEuro(saldoNetto)}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <span style={{ color: '#5DB386', fontSize: '13px', fontWeight: '600' }}>Ricevi: {formatEuro(totaleRicevi)}</span>
          <span style={{ color: '#E15B51', fontSize: '13px', fontWeight: '600' }}>Devi: {formatEuro(totaleDevi)}</span>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.toggleW}>
          <button
            onClick={() => setTipo('RICEVERE')}
            style={{
              ...s.toggleB,
              backgroundColor: tipo === 'RICEVERE' ? '#5DB386' : 'transparent',
              color: tipo === 'RICEVERE' ? 'white' : '#94A3B8',
            }}
          >
            DEVO RICEVERE
          </button>
          <button
            onClick={() => setTipo('DARE')}
            style={{
              ...s.toggleB,
              backgroundColor: tipo === 'DARE' ? '#F1F5F9' : 'transparent',
              color: tipo === 'DARE' ? '#64748B' : '#94A3B8',
            }}
          >
            DEVO DARE
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={s.labelIcon}>
              <User size={12} /> CHI
            </label>
            <input style={s.input} placeholder="Nome" value={persona} onChange={(e) => setPersona(e.target.value)} />
          </div>
          <div>
            <label style={s.labelIcon}>
              <Tag size={12} /> PERCHÉ
            </label>
            <input style={s.input} placeholder="Causale" value={causale} onChange={(e) => setCausale(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={s.labelIcon}>
              <Euro size={12} /> IMPORTO
            </label>
            <input style={s.input} placeholder="€" value={importo} onChange={(e) => setImporto(e.target.value)} />
          </div>
          <div>
            <label style={s.labelIcon}>
              <Calendar size={12} /> DATA SCADENZA
            </label>
            <input style={s.input} type="date" value={scadenza} onChange={(e) => setScadenza(e.target.value)} />
          </div>
        </div>

        <button
          style={{ ...s.btnPrimary, backgroundColor: tipo === 'RICEVERE' ? '#5DB386' : '#E15B51' }}
          onClick={salvaDebito}
          disabled={saving}
        >
          {saving ? 'Salvataggio...' : 'Aggiungi alla lista'}
        </button>

        {messaggio ? (
          <p style={{ marginTop: '12px', marginBottom: 0, color: messaggio.includes('salvato') ? '#16A34A' : '#DC2626' }}>
            {messaggio}
          </p>
        ) : null}
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '15px 20px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          border: '1.5px solid #F1F5F9',
          marginBottom: '16px',
        }}
      >
        <Search size={18} color="#94A3B8" />
        <input
          style={{
            border: 'none',
            outline: 'none',
            marginLeft: '10px',
            width: '100%',
            fontSize: '14px',
            background: 'transparent',
          }}
          placeholder="Filtra per persona..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {debitiFiltrati.map((item) => (
        <div key={item.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A' }}>{item.person_name}</div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>{item.reason}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: item.type === 'RICEVERE' ? '#16A34A' : '#DC2626' }}>
                {item.type === 'RICEVERE' ? '+' : '-'}
                {formatEuro(Number(item.amount))}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                {item.due_date || 'Senza scadenza'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SezioneSaldoEPrevisioni({
  movements,
  saldoIniziale,
}: {
  movements: MovementRow[];
  saldoIniziale: number;
}) {
  const saldoData = useMemo(() => {
    const aggregati = mesiOrdine.map((mese) => ({
      mese,
      iniziale: 0,
      entrate: 0,
      uscite: 0,
      finale: 0,
    }));

    movements.forEach((mov) => {
      const date = new Date(mov.created_at);
      const mese = mesiMappa[date.getMonth()];
      const target = aggregati.find((m) => m.mese === mese);
      if (!target) return;

      if (mov.type === 'ENTRATA') {
        target.entrate += Number(mov.amount);
      } else {
        target.uscite += Number(mov.amount);
      }
    });

    let running = saldoIniziale;

    return aggregati.map((item) => {
      const iniziale = running;
      const finale = iniziale + item.entrate - item.uscite;
      running = finale;

      return {
        ...item,
        iniziale,
        finale,
      };
    });
  }, [movements, saldoIniziale]);

  const totaleEntrate = saldoData.reduce((acc, item) => acc + item.entrate, 0);
  const totaleUscite = saldoData.reduce((acc, item) => acc + item.uscite, 0);
  const saldoFinaleAnno = saldoData[saldoData.length - 1]?.finale ?? saldoIniziale;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontWeight: '800', fontSize: '22px', color: '#1E293B' }}>
          Saldo e Previsioni
        </h3>

        <button
          style={{
            padding: '10px 18px',
            borderRadius: '18px',
            border: '1.5px solid #3B82F6',
            background: 'white',
            color: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
          }}
          onClick={() => alert('Il CSV lo colleghiamo nel prossimo step.')}
        >
          <Download size={16} />
          CSV
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '34px',
          padding: '24px 18px 18px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            height: '190px',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '0 6px 10px',
          }}
        >
          {saldoData.map((item) => {
            const valori = saldoData.map((x) => x.finale);
            const minFinale = Math.min(...valori, 0);
            const maxFinale = Math.max(...valori, 1);
            const normalized = ((item.finale - minFinale) / (maxFinale - minFinale || 1)) * 150 + 20;

            return (
              <div
                key={item.mese}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6',
                    marginBottom: `${normalized}px`,
                    boxShadow: '0 0 0 4px rgba(59,130,246,0.10)',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    color: '#94A3B8',
                    fontWeight: 500,
                    marginTop: '12px',
                  }}
                >
                  {item.mese}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '18px 10px', textAlign: 'left', fontSize: '11px', color: '#0F172A', fontWeight: 800 }}>
                MESE
              </th>
              <th style={{ padding: '18px 10px', textAlign: 'right', fontSize: '11px', color: '#64748B', fontWeight: 800 }}>
                INIZIALE
              </th>
              <th style={{ padding: '18px 10px', textAlign: 'right', fontSize: '11px', color: '#10B981', fontWeight: 800 }}>
                ENTRATE
              </th>
              <th style={{ padding: '18px 10px', textAlign: 'right', fontSize: '11px', color: '#EF4444', fontWeight: 800 }}>
                USCITE
              </th>
              <th style={{ padding: '18px 10px', textAlign: 'right', fontSize: '11px', color: '#0F172A', fontWeight: 800 }}>
                FINALE
              </th>
            </tr>
          </thead>

          <tbody>
            {saldoData.map((row) => (
              <tr key={row.mese} style={{ borderTop: '1px solid #EEF2F7' }}>
                <td style={{ padding: '16px 10px', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  {row.mese}
                </td>
                <td style={{ padding: '16px 10px', fontSize: '14px', fontWeight: 700, color: '#64748B', textAlign: 'right' }}>
                  {formatEuro(row.iniziale)}
                </td>
                <td style={{ padding: '16px 10px', fontSize: '14px', fontWeight: 700, color: '#10B981', textAlign: 'right' }}>
                  {formatEuro(row.entrate)}
                </td>
                <td style={{ padding: '16px 10px', fontSize: '14px', fontWeight: 700, color: '#EF4444', textAlign: 'right' }}>
                  {formatEuro(row.uscite)}
                </td>
                <td style={{ padding: '16px 10px', fontSize: '14px', fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>
                  {formatEuro(row.finale)}
                </td>
              </tr>
            ))}

            <tr style={{ backgroundColor: '#3B82F6', color: 'white' }}>
              <td style={{ padding: '18px 10px', fontWeight: 800 }}>TOTALI</td>
              <td style={{ padding: '18px 10px', textAlign: 'right', fontWeight: 800 }}>
                {formatEuro(saldoIniziale)}
              </td>
              <td style={{ padding: '18px 10px', textAlign: 'right', fontWeight: 800 }}>
                {formatEuro(totaleEntrate)}
              </td>
              <td style={{ padding: '18px 10px', textAlign: 'right', fontWeight: 800 }}>
                {formatEuro(totaleUscite)}
              </td>
              <td style={{ padding: '18px 10px', textAlign: 'right', fontWeight: 800 }}>
                {formatEuro(saldoFinaleAnno)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SezioneObiettivi({
  userId,
  goals,
  onSaved,
}: {
  userId: string;
  goals: GoalRow[];
  onSaved: () => Promise<void>;
}) {
  const [nome, setNome] = useState('');
  const [target, setTarget] = useState('');
  const [scadenza, setScadenza] = useState('');
  const [saving, setSaving] = useState(false);
  const [messaggio, setMessaggio] = useState('');

  const salvaObiettivo = async () => {
    setMessaggio('');

    if (!nome.trim() || !target.trim()) {
      setMessaggio('Compila nome e importo obiettivo.');
      return;
    }

    setSaving(true);

    const targetNumber = Number(target.replace(',', '.'));

    const { error } = await supabase.from('goals').insert({
      user_id: userId,
      name: nome.trim(),
      target_amount: targetNumber,
      current_amount: 0,
      deadline: scadenza || null,
    });

    if (error) {
      setMessaggio(error.message);
      setSaving(false);
      return;
    }

    setNome('');
    setTarget('');
    setScadenza('');
    setMessaggio('Obiettivo salvato.');
    setSaving(false);
    await onSaved();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="#8B5CF6" />
          <h3 style={{ margin: 0, fontWeight: '800' }}>Obiettivi</h3>
        </div>
        <button
          style={{
            background: '#F1F5F9',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          <X size={18} color="#94A3B8" />
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#EEF2FF',
          padding: '15px',
          borderRadius: '20px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#3730A3',
        }}
      >
        ✨ <b>L'IA dice:</b> Continua così: quando inizieremo a leggere i dati reali, qui potremo farti consigli automatici. 💎
      </div>

      <div style={s.card}>
        <input
          style={s.input}
          placeholder="Nome dell'obiettivo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={s.labelIcon}>Importo Obiettivo</label>
            <input style={s.input} placeholder="€" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div>
            <label style={s.labelIcon}>Scadenza obiettivo</label>
            <input style={s.input} type="date" value={scadenza} onChange={(e) => setScadenza(e.target.value)} />
          </div>
        </div>
        <button style={{ ...s.btn, backgroundColor: '#8B5CF6' }} onClick={salvaObiettivo} disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva Obiettivo'}
        </button>

        {messaggio ? (
          <p style={{ marginTop: '12px', marginBottom: 0, color: messaggio.includes('salvato') ? '#16A34A' : '#DC2626' }}>
            {messaggio}
          </p>
        ) : null}
      </div>

      {goals.map((goal) => {
        const progress =
          goal.target_amount > 0
            ? Math.max(0, Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100))
            : 0;

        return (
          <div key={goal.id} style={{ ...s.card, borderLeft: '6px solid #5DB386' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
              <span>{goal.name}</span>
              <span style={{ color: '#94A3B8', fontSize: '12px' }}>{goal.deadline || 'Senza data'}</span>
            </div>

            <div style={{ marginTop: '8px', color: '#64748B', fontSize: '13px' }}>
              {formatEuro(Number(goal.current_amount))} / {formatEuro(Number(goal.target_amount))}
            </div>

            <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '10px', marginTop: '15px' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#5DB386', borderRadius: '10px' }} />
            </div>

            <div
              style={{
                color: '#5DB386',
                fontSize: '12px',
                marginTop: '10px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CheckCircle2 size={14} /> In lavorazione
            </div>
          </div>
        );
      })}
    </div>
  );
}