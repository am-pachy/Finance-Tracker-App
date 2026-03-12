import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import logo from './assets/golden-snake-logo.png';

type Screen = 'splash' | 'login' | 'app';
type MovimentoTipo = 'USCITA' | 'ENTRATA';
type DebitoTipo = 'RICEVERE' | 'DARE';

const APP_WIDTH = 480;

const saldoData = [
  { mese: 'Mar', in: 3200, out: 1800, fine: 3900 },
  { mese: 'Apr', in: 3200, out: 1800, fine: 5300 },
  { mese: 'Mag', in: 3200, out: 1800, fine: 6700 },
  { mese: 'Giu', in: 3200, out: 1800, fine: 8100 },
  { mese: 'Lug', in: 3200, out: 1800, fine: 9500 },
  { mese: 'Ago', in: 3200, out: 1800, fine: 10900 },
  { mese: 'Set', in: 3200, out: 1800, fine: 12300 },
  { mese: 'Ott', in: 3200, out: 1800, fine: 13700 },
  { mese: 'Nov', in: 3200, out: 1800, fine: 15100 },
  { mese: 'Dic', in: 3200, out: 1800, fine: 16500 },
  { mese: 'Gen', in: 3200, out: 1800, fine: 17900 },
  { mese: 'Feb', in: 3200, out: 1800, fine: 19300 },
];

const totaleIn = saldoData.reduce((acc, item) => acc + item.in, 0);
const totaleOut = saldoData.reduce((acc, item) => acc + item.out, 0);
const deltaTotale = totaleIn - totaleOut;

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

  useEffect(() => {
    if (screen !== 'splash') return;
    const timer = setTimeout(() => setScreen('login'), 1500);
    return () => clearTimeout(timer);
  }, [screen]);

  if (screen === 'splash') return <SplashScreen />;
  if (screen === 'login') return <LoginScreen onLogin={() => setScreen('app')} />;

  return <MainApp />;
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

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

        <button onClick={onLogin} style={s.authBtn}>
          Entra
        </button>

        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#3B82F6',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          Nuovo qui? Registrati
        </button>
      </div>
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('movimenti');

  return (
    <div style={s.page}>
      <div style={s.shell}>
        <div style={s.app}>
          <header style={s.header}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Ciao, Anna! 🐍</h2>
                <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#94A3B8' }}>Insieme a Michele</p>
              </div>
            </div>
          </header>

          <main style={{ padding: '0 20px' }}>
            {activeTab === 'movimenti' && <SezioneMovimenti />}
            {activeTab === 'debiti' && <SezioneDebiti />}
            {activeTab === 'saldo' && <SezioneSaldoEPrevisioni />}
            {activeTab === 'obiettivi' && <SezioneObiettivi />}
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

function SezioneMovimenti() {
  const [tipo, setTipo] = useState<MovimentoTipo>('USCITA');
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('Casa');

  const accent = tipo === 'USCITA' ? '#E15B51' : '#5DB386';

  const categorie = [
    { nome: 'Casa', icona: Home },
    { nome: 'Auto', icona: Car },
    { nome: 'Scuola', icona: GraduationCap },
    { nome: 'Animali', icona: Heart },
  ];

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
          <input style={s.input} placeholder="€" />
        </div>
        <div>
          <label style={s.labelIcon}>DATA {tipo === 'USCITA' ? 'ADDEBITO' : 'ACCREDITO'}</label>
          <input style={s.input} type="date" defaultValue="2026-03-12" />
        </div>
      </div>

      <label style={s.labelIcon}>PERIODICITÀ</label>
      <select style={s.input}>
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
        <input style={{ ...s.input, marginBottom: 0 }} type="number" defaultValue="1" />
      </div>

      <button style={{ ...s.btn, backgroundColor: accent, marginTop: '20px' }}>
        Salva {tipo === 'USCITA' ? 'Uscita' : 'Entrata'}
      </button>
    </div>
  );
}

function SezioneDebiti() {
  const [tipo, setTipo] = useState<DebitoTipo>('RICEVERE');

  return (
    <div>
      <div style={s.darkCard}>
        <p style={{ fontSize: '10px', opacity: 0.6, fontWeight: '800' }}>SALDO NETTO</p>
        <h1 style={{ fontSize: '48px', margin: '5px 0', fontWeight: '800' }}>€ 0</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <span style={{ color: '#5DB386', fontSize: '13px', fontWeight: '600' }}>Ricevi: €0</span>
          <span style={{ color: '#E15B51', fontSize: '13px', fontWeight: '600' }}>Devi: €0</span>
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
            <input style={s.input} placeholder="Nome" />
          </div>
          <div>
            <label style={s.labelIcon}>
              <Tag size={12} /> PERCHÉ
            </label>
            <input style={s.input} placeholder="Causale" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={s.labelIcon}>
              <Euro size={12} /> IMPORTO
            </label>
            <input style={s.input} placeholder="€" />
          </div>
          <div>
            <label style={s.labelIcon}>
              <Calendar size={12} /> DATA SCADENZA
            </label>
            <input style={s.input} placeholder="gg/mm/aaaa" />
          </div>
        </div>

        <button style={{ ...s.btnPrimary, backgroundColor: tipo === 'RICEVERE' ? '#5DB386' : '#E15B51' }}>
          Aggiungi alla lista
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '15px 20px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          border: '1.5px solid #F1F5F9',
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
        />
      </div>
    </div>
  );
}

function SezioneSaldoEPrevisioni() {
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
            const minFine = saldoData[0].fine;
            const maxFine = saldoData[saldoData.length - 1].fine;
            const normalized =
              ((item.fine - minFine) / (maxFine - minFine || 1)) * 150 + 20;

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
              <th
                style={{
                  padding: '18px 14px',
                  textAlign: 'left',
                  fontSize: '11px',
                  color: '#0F172A',
                  fontWeight: 800,
                }}
              >
                MESE
              </th>
              <th
                style={{
                  padding: '18px 14px',
                  fontSize: '11px',
                  color: '#10B981',
                  fontWeight: 800,
                }}
              >
                IN
              </th>
              <th
                style={{
                  padding: '18px 14px',
                  fontSize: '11px',
                  color: '#EF4444',
                  fontWeight: 800,
                }}
              >
                OUT
              </th>
              <th
                style={{
                  padding: '18px 14px',
                  textAlign: 'right',
                  fontSize: '11px',
                  color: '#0F172A',
                  fontWeight: 800,
                }}
              >
                FINE
              </th>
            </tr>
          </thead>

          <tbody>
            {saldoData.map((row) => (
              <tr key={row.mese} style={{ borderTop: '1px solid #EEF2F7' }}>
                <td style={{ padding: '16px 14px', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                  {row.mese}
                </td>
                <td style={{ padding: '16px 14px', fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                  +{row.in}€
                </td>
                <td style={{ padding: '16px 14px', fontSize: '14px', fontWeight: 700, color: '#EF4444' }}>
                  -{row.out}€
                </td>
                <td
                  style={{
                    padding: '16px 14px',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#0F172A',
                    textAlign: 'right',
                  }}
                >
                  {row.fine}€
                </td>
              </tr>
            ))}

            <tr style={{ backgroundColor: '#3B82F6', color: 'white' }}>
              <td style={{ padding: '18px 14px', fontWeight: 800 }}>TOTALI</td>
              <td style={{ padding: '18px 14px', fontWeight: 800 }}>{totaleIn}€</td>
              <td style={{ padding: '18px 14px', fontWeight: 800 }}>{totaleOut}€</td>
              <td style={{ padding: '18px 14px', fontWeight: 800, textAlign: 'right' }}>Δ {deltaTotale}€</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SezioneObiettivi() {
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
        ✨ <b>L'IA dice:</b> Ottimo lavoro! Stai risparmiando il massimo per i tuoi obiettivi. 💎
      </div>

      <div style={s.card}>
        <input style={s.input} placeholder="Nome dell'obiettivo" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={s.labelIcon}>Importo Obiettivo</label>
            <input style={s.input} placeholder="€" />
          </div>
          <div>
            <label style={s.labelIcon}>Scadenza obiettivo</label>
            <input style={s.input} type="date" />
          </div>
        </div>
        <button style={{ ...s.btn, backgroundColor: '#8B5CF6' }}>Salva Obiettivo</button>
      </div>

      <div style={{ ...s.card, borderLeft: '6px solid #5DB386' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
          <span>Pagamento Mutuo</span>
          <span style={{ color: '#94A3B8', fontSize: '12px' }}>2026-12</span>
        </div>
        <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '10px', marginTop: '15px' }}>
          <div style={{ width: '70%', height: '100%', backgroundColor: '#5DB386', borderRadius: '10px' }} />
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
          <CheckCircle2 size={14} /> In linea con il risparmio
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#F5F3FF',
          padding: '25px',
          borderRadius: '30px',
          border: '1px solid #DDD6FE',
        }}
      >
        <p style={{ margin: 0, color: '#7C3AED', fontWeight: '800', fontSize: '14px', marginBottom: '15px' }}>
          Prova a spendere di più ogni mese:
        </p>
        <input type="range" style={{ width: '100%', accentColor: '#8B5CF6' }} />
        <div style={{ textAlign: 'right', color: '#8B5CF6', fontWeight: '700', marginTop: '10px' }}>+0€</div>
      </div>
    </div>
  );
}