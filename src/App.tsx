import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [isLogged, setIsLogged] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // STATO SPESE (Inizialmente con esempi, poi collegato a Supabase)
  const [expenses, setExpenses] = useState([
    { id: 1, label: 'Spesa Carrefour', amount: 45.20, cat: '🍕', date: 'Oggi' },
    { id: 2, label: 'Rifornimento Eni', amount: 60.00, cat: '🚗', date: 'Ieri' }
  ]);

  const [newExpense, setNewExpense] = useState({ label: '', amount: '', cat: '🍕' });

  const addExpense = () => {
    if (!newExpense.label || !newExpense.amount) return;
    const item = {
      id: Date.now(),
      label: newExpense.label,
      amount: parseFloat(newExpense.amount),
      cat: newExpense.cat,
      date: 'Ora'
    };
    setExpenses([item, ...expenses]);
    setShowAddModal(false);
    setNewExpense({ label: '', amount: '', cat: '🍕' });
  };

  if (!isLogged) return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="brand-title">Financial <br/> Tracker App</h1>
        <button className="primary-btn" onClick={() => setIsLogged(true)}>Entra</button>
        <p style={{ marginTop: '20px', fontSize: '10px', color: '#94a3b8' }}>
          © 2026 - <b>Anna Marchetto</b> - Privacy Safe
        </p>
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
              € {expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
            </h1>
          </div>

          <div className="card">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
              <h3>Ultime Spese</h3>
              <button className="primary-btn" 
                      style={{width:'auto', padding:'8px 15px', marginTop:0, fontSize:'12px'}}
                      onClick={() => setShowAddModal(true)}>+ Aggiungi</button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              {expenses.map(ex => (
                <div key={ex.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                    <span style={{fontSize:'20px', background:'#f1f5f9', padding:'8px', borderRadius:'12px'}}>{ex.cat}</span>
                    <div>
                      <p style={{fontWeight:700, fontSize:'14px'}}>{ex.label}</p>
                      <p style={{fontSize:'11px', color:'#64748b'}}>{ex.date}</p>
                    </div>
                  </div>
                  <b style={{color:'#dc2626'}}>- € {ex.amount.toFixed(2)}</b>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* MODALE DI INSERIMENTO (Semplice overlay) */}
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
            <input type="text" placeholder="Cosa hai comprato?" className="input-field" 
                   value={newExpense.label} onChange={e => setNewExpense({...newExpense, label: e.target.value})} />
            <input type="number" placeholder="Importo €" className="input-field" 
                   value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
            
            <div style={{display:'flex', gap:'10px'}}>
              <button className="primary-btn" onClick={addExpense}>Salva</button>
              <button className="nav-btn" onClick={() => setShowAddModal(false)} style={{width:'100%'}}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Impostazioni (Codice precedente...) */}
      {tab === 'settings' && (
         <div className="card">
           <h3>Impostazioni Anna Marchetto</h3>
           <p style={{fontSize:'12px', marginTop:'10px'}}>Versione Alpha 1.0 - Compliance Mode ON</p>
           <button className="primary-btn" style={{marginTop:'20px'}} onClick={() => setTab('dashboard')}>Indietro</button>
         </div>
      )}
    </div>
  );
}
