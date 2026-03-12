import { useState, useEffect, useMemo } from 'react'; // useMemo è qui per farti felice!
import { supabase } from './supabaseClient';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [tab, setTab] = useState('dashboard');
  const [profile, setProfile] = useState({ income: 0, fixedCosts: 0 });
  const [movements, setMovements] = useState<any[]>([]);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Il form per i tuoi movimenti (simpatico ma professionale!)
  const [newMov, setNewMov] = useState({ desc: '', amount: '', cat: '🍕', type: 'uscita', nature: 'una_tantum' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadData(session.user.id);
    });
  }, []);

  async function loadData(userId: string) {
    // Cerchiamo il tuo profilo con cautela
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    
    if (prof) {
      setProfile({ income: prof.monthly_income || 0, fixedCosts: prof.monthly_fixed_costs || 0 });
    } else {
      setIsFirstLogin(true); // Benvenuta per la prima volta!
    }

    // Carichiamo i movimenti (usiamo la tabella corretta 'movements')
    const { data: movs } = await supabase.from('movements').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (movs) setMovements(movs);
  }

  // LOGICA PREVISIONALE: Calcoliamo quanto puoi spendere senza stress
  const { margineReale, budgetGiornaliero } = useMemo(() => {
    const entrateExtra = movements.filter((m: any) => m.type === 'entrata').reduce((acc: number, m: any) => acc + m.amount, 0);
    const fisseReg = movements.filter((m: any) => m.type === 'uscita' && m.nature === 'fissa').reduce((acc: number, m: any) => acc + m.amount, 0);
    const usciteVariabili = movements.filter((m: any) => m.type === 'uscita' && m.nature === 'una_tantum').reduce((acc: number, m: any) => acc + m.amount, 0);

    const residuo = (profile.income + entrateExtra) - (profile.fixedCosts + fisseReg) - usciteVariabili;
    
    const oggi = new Date();
    const giorniRimanenti = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0).getDate() - oggi.getDate() + 1;

    return { 
      margineReale: residuo, 
      budgetGiornaliero: residuo > 0 ? residuo / giorniRimanenti : 0 
    };
  }, [profile, movements]);

  const formatEuro = (v: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);

  const handleAddMovement = async () => {
    if (!newMov.desc || !newMov.amount) return;
    setIsSaving(true);
    
    const { data, error } = await supabase.from('movements').insert([{ 
      user_id: session.user.id, 
      description: newMov.desc, 
      amount: parseFloat(newMov.amount), 
      type: newMov.type,
      nature: newMov.nature,
      category: newMov.type === 'uscita' ? newMov.cat : '💰'
    }]).select();
    
    if (!error && data) {
      setMovements([data[0], ...movements]);
      setShowAddModal(false);
      setNewMov({ desc: '', amount: '', cat: '🍕', type: 'uscita', nature: 'una_tantum' });
    }
    setIsSaving(false);
  };

  if (!session) return (
    <div className="app-container" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh'}}>
      <div className="card" style={{textAlign:'center', borderRadius:'40px', padding:'40px'}}>
        <h1 style={{fontSize:32, marginBottom:10}}>Financial Tracker</h1>
        <p style={{color:'#64748b', marginBottom:30}}>Bentornata Anna! ✨<br/>Pronta a far sorridere il portafoglio?</p>
        <button className="primary-btn" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>Entra con Google</button>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {isFirstLogin && (
        <div className="modal-overlay">
          <div className="card" style={{textAlign:'center'}}>
            <h2>Piacere di conoscerti! 👋</h2>
            <p style={{margin:'15px 0', color:'#64748b'}}>Impostiamo i tuoi numeri base per fare magie?</p>
            <input type="number" placeholder="Stipendio Mensile 💰" className="input-field" onChange={e => setProfile({...profile, income: +e.target.value})} />
            <input type="number" placeholder="Spese Fisse (Affitto, etc) 🏠" className="input-field" onChange={e => setProfile({...profile, fixedCosts: +e.target.value})} />
            <button className="primary-btn" onClick={async () => {
              await supabase.from('profiles').upsert({ id: session.user.id, monthly_income: profile.income, monthly_fixed_costs: profile.fixedCosts });
              setIsFirstLogin(false);
            }}>Si parte! 🚀</button>
          </div>
        </div>
      )}

      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
        <div>
          <h2 style={{fontWeight:900}}>Dashboard</h2>
          <p style={{fontSize:'13px', color:'#64748b'}}>Ciao Anna, come andiamo oggi? ✨</p>
        </div>
        <span style={{fontSize:'24px', cursor:'pointer'}} onClick={() => supabase.auth.signOut()}>⚙️</span>
      </header>

      {tab === 'dashboard' && (
        <>
          <div className="card ai-card">
            <h3 style={{fontSize:'15px'}}>🤖 AI Advisor dice:</h3>
            <p style={{fontSize:'14px', marginTop:'10px'}}>Oggi puoi spendere fino a:<br/>
              <strong style={{fontSize:'24px', color: '#1d4ed8'}}>{formatEuro(budgetGiornaliero)}</strong>
            </p>
            <p style={{fontSize:'11px', color:'#1e40af', marginTop:'8px', fontStyle:'italic'}}>
              {budgetGiornaliero > 45 ? "Ottimo margine, goditi la giornata! 😉" : "Oggi meglio risparmiare per domani, Anna. ☕"}
            </p>
          </div>

          <div className="card">
            <p style={{fontSize:'12px', color:'#64748b', fontWeight:700}}>MARGINE REALE RIMASTO</p>
            <h1 style={{fontSize:'42px', color: margineReale >= 0 ? '#1d4ed8' : '#dc2626'}}>{formatEuro(margineReale)}</h1>
          </div>

          <button className="primary-btn" onClick={() => setShowAddModal(true)}>+ Registra un colpo di testa 💸</button>
        </>
      )}

      {tab === 'movements' && (
        <div className="card">
          <h3 style={{marginBottom:'15px'}}>📑 I tuoi movimenti</h3>
          {movements.map(m => (
            <div key={m.id} style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #f1f5f9'}}>
              <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <span>{m.category}</span>
                <div>
                  <p style={{fontWeight:700, fontSize:'14px'}}>{m.description}</p>
                  <p style={{fontSize:'10px', color:'#94a3b8'}}>{m.nature === 'fissa' ? 'Costo Fisso 🗓️' : 'Solo per oggi ✌️'}</p>
                </div>
              </div>
              <span style={{fontWeight:'bold', color: m.type === 'entrata' ? '#10b981' : '#dc2626'}}>
                {m.type === 'entrata' ? '+' : '-'}{formatEuro(m.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="card" style={{width:'100%', maxWidth:'400px'}}>
            <h3 style={{marginBottom:'15px'}}>Cos'è successo stavolta? 🤔</h3>
            <div style={{display:'