import React from 'react';
import { Home, Users, MessageSquare, Instagram, BarChart2, Settings } from 'lucide-react';

const styles = {
  layout: { display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' },
  sidebar: { width: '260px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '24px', borderBottom: '1px solid var(--color-border)' },
  logo: { color: 'var(--color-secondary)', fontSize: '24px', fontWeight: 'bold', margin: 0 },
  nav: { padding: '16px 0', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', padding: '12px 24px', color: 'var(--color-text-secondary)', textDecoration: 'none', gap: '12px', cursor: 'pointer', transition: 'background-color 0.2s' },
  navItemHover: { backgroundColor: 'var(--color-surface-hover)' },
  mainContent: { flex: 1, backgroundColor: 'var(--color-background)' },
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  card: { backgroundColor: 'var(--color-surface)', borderRadius: '8px', padding: '24px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', marginBottom: '24px' },
  cardTitle: { color: 'var(--color-secondary)', fontSize: '18px', fontWeight: '600', marginBottom: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  button: { backgroundColor: 'var(--color-secondary)', color: '#000', padding: '10px 16px', borderRadius: '4px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' },
};

function App() {
  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard' },
    { icon: <Users size={20} />, label: 'Empresários' },
    { icon: <MessageSquare size={20} />, label: 'Pesquisas (NPS)' },
    { icon: <Instagram size={20} />, label: 'Marketing AI' },
    { icon: <BarChart2 size={20} />, label: 'Análise de Concorrentes' },
    { icon: <Settings size={20} />, label: 'Configurações' },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.logo}>IFA Premium</h1>
        </div>
        <nav style={styles.nav}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              style={{ ...styles.navItem }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.navItemHover.backgroundColor}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ color: 'var(--color-tertiary)' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.container}>
          <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '24px' }}>Visão Geral</h2>
          
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Empresários Ativos</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>142</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '8px' }}>+12 neste mês</p>
            </div>
            
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>NPS Médio</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-success)' }}>9.4</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '8px' }}>Últimos 30 dias</p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Pautas de IA Geradas</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>28</p>
              <button style={{ ...styles.button, marginTop: '16px', fontSize: '14px' }}>
                Gerar Novas Pautas
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Últimas Pesquisas Recebidas</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Aqui entrará a listagem de respostas do formulário de pesquisa integrado via WhatsApp.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
