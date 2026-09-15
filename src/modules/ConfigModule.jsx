import React, { useState } from 'react';
import { Settings, Key, Link as LinkIcon, Database, Save, Loader2, CheckCircle2 } from 'lucide-react';

const styles = {
  container: { width: '100%', maxWidth: '800px' },
  card: {
    backgroundColor: 'var(--color-surface)', borderRadius: '8px', padding: '24px', 
    border: '1px solid var(--color-border)', marginBottom: '24px'
  },
  cardTitle: { 
    color: 'var(--color-text-primary)', fontSize: '18px', fontWeight: 'bold', 
    marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' 
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    color: 'var(--color-secondary)', fontSize: '14px', fontWeight: 'bold', 
    marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '8px'
  },
  input: {
    width: '100%', padding: '12px', backgroundColor: 'var(--color-background)', 
    border: '1px solid var(--color-border)', borderRadius: '4px', 
    color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'monospace'
  },
  inputHint: {
    color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '6px'
  },
  button: {
    backgroundColor: 'var(--color-secondary)', color: '#000', padding: '12px 24px', 
    borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px'
  }
};

export default function ConfigModule() {
  const [loading, setLoading] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Estados locais simulando a leitura das configurações
  const [configs, setConfigs] = useState({
    anthropicKey: 'sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXX',
    apifyKey: 'apify_api_XXXXXXXXXXXXXXXXXXXXXXXXXX',
    zapiInstance: '3C5A8B9D',
    zapiToken: '8B9D-4F1A-9C2E-7D4F',
    fbToken: 'EAAGm0PX4ZCkwBOZXXXXXXXXXXXXXXXXXXXXXX'
  });

  const handleSave = () => {
    setLoading(true);
    setSalvo(false);
    // Simula salvamento no Firestore
    setTimeout(() => {
      setLoading(false);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}><Settings size={24} color="var(--color-secondary)" /> Configurações do Sistema</h2>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><Key size={16} style={{display:'inline', marginRight:'8px'}} /> Inteligência Artificial</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Anthropic API Key (Claude 3.5 Sonnet)</label>
            <input type="password" style={styles.input} value={configs.anthropicKey} onChange={e => setConfigs({...configs, anthropicKey: e.target.value})} />
            <div style={styles.inputHint}>Usado para gerar Pautas, analisar Concorrentes e criar mensagens de CRM.</div>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><Database size={16} style={{display:'inline', marginRight:'8px'}} /> Integrações de Dados</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Apify API Token</label>
            <input type="password" style={styles.input} value={configs.apifyKey} onChange={e => setConfigs({...configs, apifyKey: e.target.value})} />
            <div style={styles.inputHint}>Usado para raspar dados dos perfis de Instagram dos concorrentes.</div>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><LinkIcon size={16} style={{display:'inline', marginRight:'8px'}} /> Canais de Comunicação</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Instância Z-API (WhatsApp)</label>
            <input type="text" style={styles.input} value={configs.zapiInstance} onChange={e => setConfigs({...configs, zapiInstance: e.target.value})} />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Token Z-API</label>
            <input type="password" style={styles.input} value={configs.zapiToken} onChange={e => setConfigs({...configs, zapiToken: e.target.value})} />
            <div style={styles.inputHint}>Usado para disparar as pesquisas de NPS pelo WhatsApp.</div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Facebook Graph API Token (Page Access Token)</label>
            <input type="password" style={styles.input} value={configs.fbToken} onChange={e => setConfigs({...configs, fbToken: e.target.value})} />
            <div style={styles.inputHint}>Necessário permissões: pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish.</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
          <button style={styles.button} onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            Salvar Configurações
          </button>
          
          {salvo && (
            <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
              <CheckCircle2 size={18} /> Salvo com sucesso!
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
