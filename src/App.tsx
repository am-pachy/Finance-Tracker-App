import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './index.css';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [tab, setTab] = useState('dashboard');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ label: '', amount: '', cat: '🍕' });

  // 1. Inizializzazione Sessione e Caricamento Dati
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchExpenses(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchExpenses(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Leggi Spese dal DB
  async function fetchExpenses(userId: string) {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setExpenses(data);
  }

  // 3. Salva Spesa sul DB
  const addExpense = async () => {
    if (!newExpense.label || !newExpense.amount || !session) return;

    const { error } = await supabase.from('expenses').insert([{
      user_id: session.user.id,
      label: newExpense.label,
      amount: parseFloat(newExpense.amount),
      category: newExpense.cat
    }]);

    if (!error) {
      fetchExpenses(session.user.id);
      setShowAddModal(false);
      setNewExpense({ label: '', amount: '', cat: '🍕' });
    } else {
      alert("Errore nel salvataggio: " + error.message);
    }
  };

  if (!session) return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand-title">Financial <br/> Tracker App</h1>
        <button className="primary-btn" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>Accedi con Google</button>
        <p style={{ marginTop: '20px', fontSize: '10px', color: '#94a3b8' }}>© 2026 - Anna Marchetto</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 className="brand-title" style={{fontSize:'22px'}}>Tracker</h2>
        <button onClick={() => setTab('settings')} className="nav-btn" style={{fontSize:'24px'}}>⚙️</button>
      </header>

      {tab === 'dashboard' && (
        <>
          <div className="card">
            <p style={{fontSize:'11px', fontWeight:800, color:'#64748b'}}>TOTALE SPESO</p>
            <h1 style={{fontSize:'36px', color:'#dc2626'}}>
              € {expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </h1>
          </div>

          <div className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3>Ultime Spese</h3>
              <button className="primary-btn" style={{width:'auto', padding:'8px 15px', marginTop:0}} onClick={() => setShowAddModal(true)}>+</button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              {expenses.map(ex => (
                <div key={ex.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                    <span style={{fontSize:'20px', background:'#f1f5f9', padding:'8px', borderRadius:'12px'}}>{ex.category}</span>
                    <div>
                      <p style={{fontWeight:700, fontSize:'14px'}}>{ex.label}</p>
                      <p style={{fontSize:'10px', color:'#64748b'}}>{new Date(ex.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <b style={{color:'#dc2626'}}>- € {ex.amount.toFixed(2)}</b>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-muted">Nessuna spesa inserita.</p>}
            </div>
          </div>
        </>
      )}

      {showAddModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end', zIndex:1000}}>
          <div className="card" style={{width:'100%', marginBottom:0, borderRadius:'24px 24px 0 0', padding:'30px'}}>
            <h3>Nuova Spesa</h3>
            <select className="input-field" value={newExpense.cat} onChange={e => setNewExpense({...newExpense, cat: e.target.value})}>
              <option value="🍕">Cibo 🍕</option>
              <option value="🚗">Auto 🚗</option>
              <option value="🏠">Casa 🏠</option>
              <option value="🛍️">Shopping 🛍️</option>
            </select>
            <input type="text" placeholder="Cosa?" className="input-field" value={newExpense.label} onChange={e => setNewExpense({...newExpense, label: e.target.value})} />
            <input type="number" placeholder="Importo" className="input-field" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
            <button className="primary-btn" onClick={addExpense}>Salva Spesa</button>
            <button className="nav-btn" onClick={() => setShowAddModal(false)} style={{width:'100%', marginTop:'10px'}}>Chiudi</button>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="card">
          <h3>Impostazioni Anna Marchetto</h3>
          <p style={{fontSize:'12px', marginTop:'20px'}}>Disclaimer: Strumento di supporto al risparmio.</p>
          <button className="primary-btn" style={{marginTop:'30px', background:'#dc2626'}} onClick={() => supabase.auth.signOut()}>Esci dall'Account</button>
          <button className="nav-btn" onClick={() => setTab('dashboard')} style={{width:'100%', marginTop:'10px'}}>Torna Indietro</button>
        </div>
      )}
    </div>
  );
}
