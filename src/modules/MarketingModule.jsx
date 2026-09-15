import React, { useState } from 'react';
import { Users, Target, FileText, Camera, Send, Search, Loader2 } from 'lucide-react';

const styles = {
  container: { width: '100%' },
  tabContainer: { 
    display: 'flex', 
    gap: '12px', 
    marginBottom: '24px',
    overflowX: 'auto',
    paddingBottom: '8px'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '20px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  tabActive: {
    backgroundColor: 'var(--color-secondary)',
    borderColor: 'var(--color-secondary)',
    color: '#000',
  },
  card: { 
    backgroundColor: 'var(--color-surface)', 
    borderRadius: '8px', 
    padding: '24px', 
    border: '1px solid var(--color-border)', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)', 
    marginBottom: '24px' 
  },
  cardTitle: { 
    color: 'var(--color-secondary)', 
    fontSize: '18px', 
    fontWeight: '600', 
    marginBottom: '16px' 
  },
  input: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: 'var(--color-background)', 
    border: '1px solid var(--color-border)', 
    borderRadius: '4px', 
    color: 'var(--color-text-primary)', 
    outline: 'none',
    marginBottom: '16px'
  },
  textarea: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: 'var(--color-background)', 
    border: '1px solid var(--color-border)', 
    borderRadius: '4px', 
    color: 'var(--color-text-primary)', 
    outline: 'none',
    marginBottom: '16px',
    minHeight: '120px',
    resize: 'vertical'
  },
  button: { 
    backgroundColor: 'var(--color-secondary)', 
    color: '#000', 
    padding: '12px 24px', 
    borderRadius: '4px', 
    fontWeight: 'bold', 
    border: 'none', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '13px' },
  td: { padding: '12px', borderBottom: '1px solid #1f1f1f', color: 'var(--color-text-secondary)', fontSize: '14px' },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(242, 201, 76, 0.2)',
    color: 'var(--color-warning)'
  }
};

export default function MarketingModule() {
  const [abaAtiva, setAbaAtiva] = useState('recuperar');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Mocks para a UI
  const mockClientes = [
    { nome: 'Carlos Silva (Empreiteira)', dias: 145, valor: 'R$ 15.000', risco: 'Alto' },
    { nome: 'Joana Martins (Clínica)', dias: 92, valor: 'R$ 8.500', risco: 'Médio' },
    { nome: 'Roberto Alves (Varejo)', dias: 45, valor: 'R$ 3.200', risco: 'Baixo' },
  ];

  const simularBackend = (tempo = 1500) => {
    setLoading(true);
    setResultado(null);
    setTimeout(() => {
      setLoading(false);
      setResultado("Operação concluída com sucesso! (Integração com Firebase Functions pendente de apontamento)");
    }, tempo);
  };

  return (
    <div style={styles.container}>
      
      {/* Abas Superiores */}
      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tab, ...(abaAtiva === 'recuperar' ? styles.tabActive : {}) }}
          onClick={() => { setAbaAtiva('recuperar'); setResultado(null); }}
        >
          <Users size={18} /> Recuperar Clientes
        </button>
        <button 
          style={{ ...styles.tab, ...(abaAtiva === 'concorrentes' ? styles.tabActive : {}) }}
          onClick={() => { setAbaAtiva('concorrentes'); setResultado(null); }}
        >
          <Target size={18} /> Concorrentes
        </button>
        <button 
          style={{ ...styles.tab, ...(abaAtiva === 'pautas' ? styles.tabActive : {}) }}
          onClick={() => { setAbaAtiva('pautas'); setResultado(null); }}
        >
          <FileText size={18} /> Pautas IA
        </button>
        <button 
          style={{ ...styles.tab, ...(abaAtiva === 'publicador' ? styles.tabActive : {}) }}
          onClick={() => { setAbaAtiva('publicador'); setResultado(null); }}
        >
          <Camera size={18} /> Publicador IG
        </button>
      </div>

      {/* CONTEÚDO DA ABA: RECUPERAR CLIENTES */}
      {abaAtiva === 'recuperar' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Fila de Recuperação (CRM)</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
            Empresários que pararam de investir há mais de 30 dias. Gere uma mensagem com IA para reativá-los.
          </p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>CLIENTE</th>
                  <th style={styles.th}>SUMIDO HÁ</th>
                  <th style={styles.th}>VALOR HISTÓRICO</th>
                  <th style={styles.th}>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {mockClientes.map((c, i) => (
                  <tr key={i}>
                    <td style={{ ...styles.td, fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{c.nome}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge}>{c.dias} dias</span>
                    </td>
                    <td style={styles.td}>{c.valor}</td>
                    <td style={styles.td}>
                      <button style={{ ...styles.button, padding: '8px 12px', fontSize: '12px' }} onClick={() => simularBackend(1000)}>
                        <Send size={14} /> Gerar Mensagem IA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {loading && <p style={{ color: 'var(--color-secondary)', marginTop: '20px' }}><Loader2 size={16} className="spin" /> Gerando mensagem empática...</p>}
          {resultado && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
              <p style={{ color: 'var(--color-success)', fontWeight: 'bold', marginBottom: '8px' }}>Mensagem gerada (IA do IFA):</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>"Oi Carlos! Aqui é do IFA Premium. Notei que faz um tempinho desde nosso último treinamento. Como estão os gerentes da sua empreiteira? Lembre-se: uma empresa autônoma depende de líderes fortes. Vamos agendar um bate-papo?"</p>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA: CONCORRENTES */}
      {abaAtiva === 'concorrentes' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Análise de Concorrentes (Apify + Anthropic)</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
            Colete dados do Instagram de institutos concorrentes e receba um diagnóstico da IA do IFA.
          </p>
          
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>@ do Instagram do Concorrente</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input type="text" placeholder="Ex: ibccoaching" style={{ ...styles.input, marginBottom: 0 }} />
            <button style={{ ...styles.button, width: '200px' }} onClick={() => simularBackend(2500)}>
              {loading ? <Loader2 size={18} /> : <Target size={18} />} Analisar
            </button>
          </div>

          {resultado && (
            <div style={{ padding: '16px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
              <p style={{ color: 'var(--color-success)', fontWeight: 'bold', marginBottom: '12px' }}>Diagnóstico concluído:</p>
              <ul style={{ color: 'var(--color-text-secondary)', fontSize: '14px', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>Formato Forte:</strong> Vídeos curtos (Reels) respondendo dúvidas rápidas de liderança.</li>
                <li><strong>Oportunidade para o IFA:</strong> Eles não falam muito sobre "autonomia" do dono, focam mais no lado do funcionário. O IFA deve bater forte na dor do empresário escravo do próprio negócio.</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA: PAUTAS */}
      {abaAtiva === 'pautas' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Gerador de Pautas IA</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
            Crie conteúdo focado em formar gerentes e dar autonomia aos empresários.
          </p>

          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Tema Central</label>
          <input type="text" placeholder="Ex: Como delegar tarefas sem perder o controle" style={styles.input} />

          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Público Alvo</label>
          <input type="text" placeholder="Ex: Donos de supermercados" style={styles.input} />

          <button style={styles.button} onClick={() => simularBackend(2000)}>
            {loading ? <Loader2 size={18} /> : <FileText size={18} />} Gerar Pauta Completa
          </button>
        </div>
      )}

      {/* CONTEÚDO DA ABA: PUBLICADOR */}
      {abaAtiva === 'publicador' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Publicar no Instagram</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
            Publique fotos e carrosséis diretamente na conta do IFA via Graph API.
          </p>

          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>URL da Imagem</label>
          <input type="text" placeholder="https://..." style={styles.input} />

          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Legenda do Post</label>
          <textarea placeholder="Escreva a legenda aqui..." style={styles.textarea}></textarea>

          <button style={styles.button} onClick={() => simularBackend(1500)}>
            {loading ? <Loader2 size={18} /> : <Send size={18} />} Publicar Agora
          </button>
        </div>
      )}

    </div>
  );
}
