import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState({ name: '', income: 0, fixedCosts: 0 });
  const [movements, setMovements] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Inizializzazione Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadData(session.user.id);
    });
  }, []);

  async function loadData(userId: string) {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (prof) setProfile({ name: prof.full_name, income: prof.monthly_income, fixedCosts: prof.monthly_fixed_costs });
    
    const { data: movs } = await supabase.from('movements').select('*').eq('user_id', userId);
    if (movs) setMovements(movs);
  }

  // --- LOGICA AI & CALCOLI ---
  const formatEuro = (v: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);
  
  const speseVariabiliTotali = movements.reduce((acc, m) => acc + m.amount, 0);
  const risparmioTeoricoMensile = profile.income - profile.fixedCosts;
  const margineRealeAttuale = risparmioTeoricoMensile - speseVariabiliTotali;
  
  const giorniMancanti = useMemo(() => {
    const oggi = new Date();
    const ultimoGiorno = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0).getDate();
    return ultimoGiorno - oggi.getDate() || 1;
  }, []);

  // --- SCANNER SCONTRINI ---
  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsScanning(true);
    // Simulazione AI Scan (GPT-4o / Mindee)
    setTimeout(() => {
      const newMov = { id: Date.now(), description: "Spesa AI Scan", amount: 25.50, type: 'uscita' };
      setMovements([...movements, newMov]);
      setIsScanning(false);
      alert("Scanner AI: Spesa rilevata di 25,50€!");
    }, 2000);
  };

  // 1. Schermata Onboarding
  if (session && profile.income === 0) {
    return (
      <div className="app-container">
        <div className="card" style={{maxWidth: '450px', margin: 'auto'}}>
          <h2>Benvenuto su Finance Tracker App! 🚀</h2>
          <p className="text-muted">Imposta i tuoi dati fissi per attivare l'AI Advisor.</p>
          <div style={{marginTop: '20px'}}>
            <label>Stipendio Mensile Medio</label>
            <input type="number" id="inc" className="input-field" placeholder="es. 2000" />
            <label style={{marginTop: '15px', display: 'block'}}>Spese Fisse (Affitto, Bollette...)</label>
            <input type="number" id="fix" className="input-field" placeholder="es. 800" />
            <button className="primary-btn" style={{marginTop: '20px'}} onClick={async () => {
              const inc = +(document.getElementById('inc') as HTMLInputElement).value;
              const fix = +(document.getElementById('fix') as HTMLInputElement).value;
              await supabase.from('profiles').update({ monthly_income: inc, monthly_fixed_costs: fix }).eq('id', session.user.id);
              setProfile({...profile, income: inc, fixedCosts: fix});
            }}>Salva e Inizia</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <div>
          <h1 className="page-title">Finance Tracker App</h1>
          <p className="text-muted">Analisi per <strong>{profile.name || 'Utente'}</strong></p>
        </div>
        <button className="secondary-btn" onClick={() => supabase.auth.signOut()}>Logout</button>
      </header>

      {tab === 'dashboard' && (
        <div className="grid">
          {/* AI ADVISOR BOX */}
          <div className="card ai-card" style={{gridColumn: 'span 2'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
              <span style={{fontSize: '24px'}}>🤖</span>
              <h3 style={{margin: 0}}>AI Advisor</h3>
            </div>
            <p style={{fontSize: '15px', opacity: 0.9}}>
              Per questo mese, basandoci sul tuo budget fisso, puoi spendere ancora 
              <strong style={{color: '#fbbf24'}}> {formatEuro(margineRealeAttuale / giorniMancanti)} al giorno</strong>.
            </p>
          </div>

          {/* SCANNER SCONTRINI */}
          <div className="scanner-box">
            <h4>📸 Scanner AI</h4>
            <input type="file" accept="image/*" capture="environment" id="file" hidden onChange={handleScan} />
            <button className="primary-btn" style={{marginTop: '10px', background: 'var(--accent)'}} onClick={() => document.getElementById('file')?.click()}>
              {isScanning ? "Scansione..." : "Scansiona Scontrino"}
            </button>
          </div>

          <div className="card">
            <h3>Saldo Residuo</h3>
            <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)'}}>{formatEuro(margineRealeAttuale)}</div>
            <p className="text-muted">Margine reale calcolato</p>
          </div>
        </div>
      )}

      {tab === 'forecast' && (
        <div className="card">
          <h3>🔮 Previsioni Avanzate</h3>
          <p className="text-muted">Proiezione basata su {formatEuro(risparmioTeoricoMensile)} di risparmio teorico mensile.</p>
          <table className="forecast-table">
            <thead>
              <tr>
                <th>Mese</th>
                <th>Risparmio Fisso</th>
                <th>Extra (Reali)</th>
                <th>Saldo Stimato</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5].map(i => {
                const saldo = margineRealeAttuale + (risparmioTeoricoMensile * i);
                return (
                  <tr key={i}>
                    <td>Mese +{i}</td>
                    <td>{formatEuro(risparmioTeoricoMensile)}</td>
                    <td>{i === 0 ? formatEuro(speseVariabiliTotali) : "--"}</td>
                    <td style={{fontWeight: 'bold'}}>{formatEuro(saldo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <nav className="bottom-nav">
        <button className={`nav-btn ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>HOME</button>
        <button className={`nav-btn ${tab === 'movements' ? 'active' : ''}`} onClick={() => setTab('movements')}>SPESE</button>
        <button className={`nav-btn ${tab === 'forecast' ? 'active' : ''}`} onClick={() => setTab('forecast')}>FUTURO</button>
      </nav>
    </div>
  );
}
