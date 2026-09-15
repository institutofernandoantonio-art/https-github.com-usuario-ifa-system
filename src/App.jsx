import React, { useState } from 'react';
import { 
  User, LogOut, Home as HomeIcon, MessageSquare, 
  Megaphone, BarChart2, Camera, Settings, ArrowLeft
} from 'lucide-react';

const styles = {
  // Layout Base
  layout: { 
    display: 'flex', 
    flexDirection: 'column',
    minHeight: '100vh', 
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text-primary)'
  },
  
  // Top Bar
  topBar: { 
    backgroundColor: 'var(--color-primary)', // Preto
    borderBottom: '2px solid var(--color-secondary)', // Borda dourada embaixo
    padding: '12px 24px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoText: { 
    color: 'var(--color-secondary)', // Dourado
    fontSize: '20px', 
    fontWeight: 'bold', 
    margin: 0,
    textTransform: 'uppercase'
  },
  logoSubText: {
    color: 'var(--color-text-muted)',
    fontSize: '12px',
    marginTop: '-4px'
  },
  topBarActions: {
    display: 'flex',
    gap: '12px'
  },
  iconButton: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-secondary)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  buttonSair: {
    backgroundColor: 'transparent',
    border: '1px solid var(--color-danger)',
    color: 'var(--color-danger)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  // Main Content
  mainContent: { 
    flex: 1, 
    padding: '40px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  
  // Page Title
  pageHeader: {
    marginBottom: '40px',
    textAlign: 'center'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--color-text-primary)',
    marginBottom: '8px'
  },
  pageSubtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '14px'
  },

  // Module Grid (Square buttons like the photo)
  moduleGrid: { 
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center'
  },
  moduleButton: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    width: '160px',
    height: '160px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    textDecoration: 'none',
    color: 'var(--color-text-primary)'
  },
  moduleIcon: {
    color: 'var(--color-secondary)', // Ícones dourados
    marginBottom: '16px'
  },
  moduleName: {
    fontSize: '15px',
    fontWeight: '600',
    textAlign: 'center'
  },
  moduleDesc: {
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginTop: '8px',
    padding: '0 12px'
  },

  // Login Screen
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-background)'
  },
  loginCard: {
    backgroundColor: 'var(--color-surface)',
    padding: '40px',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
  },
  loginInput: {
    width: '100%', 
    padding: '12px', 
    backgroundColor: 'var(--color-background)', 
    border: '1px solid var(--color-border)', 
    borderRadius: '6px', 
    color: 'var(--color-text-primary)', 
    marginBottom: '16px',
    outline: 'none'
  },
  loginButton: {
    width: '100%',
    backgroundColor: 'var(--color-secondary)', 
    color: '#000', 
    padding: '12px', 
    borderRadius: '6px', 
    fontWeight: 'bold',
    fontSize: '16px',
    border: 'none', 
    cursor: 'pointer',
    marginTop: '8px'
  },

  // Bottom Bar (for sub-modules)
  bottomBar: {
    backgroundColor: 'var(--color-surface)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0',
    position: 'sticky',
    bottom: 0,
    width: '100%'
  },
  bottomTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    gap: '4px'
  },
  bottomTabActive: {
    color: 'var(--color-secondary)',
  }
};

export default function App() {
  const [screen, setScreen] = useState('login'); // 'login', 'home', 'module'
  const [activeModule, setActiveModule] = useState(null);

  const modules = [
    { id: 'marketing', name: 'Marketing AI', desc: 'Geração de Pautas e Campanhas', icon: <Megaphone size={32} /> },
    { id: 'pesquisas', name: 'Pesquisas (NPS)', desc: 'Envio de WhatsApp e CRM', icon: <MessageSquare size={32} /> },
    { id: 'concorrentes', name: 'Concorrentes', desc: 'Análise de mercado e Instagram', icon: <BarChart2 size={32} /> },
    { id: 'publicador', name: 'Publicador IG', desc: 'Postagem automática no Instagram', icon: <Camera size={32} /> },
    { id: 'config', name: 'Configurações', desc: 'Ajustes do Sistema IFA', icon: <Settings size={32} /> },
  ];

  if (screen === 'login') {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h1 style={{ ...styles.logoText, fontSize: '32px', marginBottom: '8px' }}>IFA PREMIUM</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>Autonomia e Formação de Gerentes</p>
          
          <div style={{ textAlign: 'left', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>E-mail</div>
          <input type="email" placeholder="voce@ifa.com.br" style={styles.loginInput} />
          
          <div style={{ textAlign: 'left', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>Senha</div>
          <input type="password" placeholder="••••••••" style={styles.loginInput} />
          
          <button style={styles.loginButton} onClick={() => setScreen('home')}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      {/* Top Bar */}
      <header style={styles.topBar}>
        <div style={styles.logoContainer}>
          {screen === 'module' && (
            <button 
              onClick={() => { setScreen('home'); setActiveModule(null); }} 
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', marginRight: '12px' }}
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div>
            <h1 style={styles.logoText}>IFA PREMIUM</h1>
            <div style={styles.logoSubText}>Sistema de Gestão 4.0</div>
          </div>
        </div>
        
        <div style={styles.topBarActions}>
          <div style={styles.iconButton}><User size={20} /></div>
          <button style={styles.buttonSair} onClick={() => setScreen('login')}>
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {screen === 'home' && (
          <>
            <div style={styles.pageHeader}>
              <h2 style={styles.pageTitle}>Bem-vindo 👋</h2>
              <p style={styles.pageSubtitle}>Escolha um módulo para começar a gerenciar.</p>
            </div>

            <div style={styles.moduleGrid}>
              {modules.map((mod) => (
                <div 
                  key={mod.id} 
                  style={styles.moduleButton}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-secondary)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  onClick={() => { setActiveModule(mod); setScreen('module'); }}
                >
                  <div style={styles.moduleIcon}>{mod.icon}</div>
                  <div style={styles.moduleName}>{mod.name}</div>
                  <div style={styles.moduleDesc}>{mod.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {screen === 'module' && activeModule && (
          <div>
            <h2 style={{ ...styles.pageTitle, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--color-secondary)' }}>{activeModule.icon}</span>
              {activeModule.name}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>{activeModule.desc}</p>
            
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>Visão Geral</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>O painel de indicadores do módulo {activeModule.name} será renderizado aqui.</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Bar (Apenas visível dentro de um módulo, como no design de referência) */}
      {screen === 'module' && (
        <footer style={styles.bottomBar}>
          <div style={{ ...styles.bottomTab, ...styles.bottomTabActive }}>
            <BarChart2 size={24} />
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Indicadores</span>
          </div>
          <div style={styles.bottomTab}>
            <Settings size={24} />
            <span style={{ fontSize: '11px' }}>Configurar</span>
          </div>
        </footer>
      )}
    </div>
  );
}
