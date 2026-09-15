import React, { useState } from 'react';
import { Users, Target, FileText, Camera, Send, Search, Loader2 } from 'lucide-react';

const BASE_URL = 'https://us-central1-ifa-marketing-system-24.cloudfunctions.net';

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
  },
  resultadoBox: {
    marginTop: '20px', 
    padding: '16px', 
    backgroundColor: 'var(--color-background)', 
    border: '1px solid var(--color-border)', 
    borderRadius: '4px',
    whiteSpace: 'pre-wrap'
  }
};

export default function MarketingModule() {
  const [abaAtiva, setAbaAtiva] = useState('recuperar');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  // States dos formulários
  const [concorrenteInput, setConcorrenteInput] = useState('');
  const [pautaTema, setPautaTema] = useState('');
  const [pautaPublico, setPautaPublico] = useState('');
  const [igImg, setIgImg] = useState('');
  const [igLegenda, setIgLegenda] = useState('');

  // Mocks para a UI
  const mockClientes = [
    { nome: 'Carlos Silva (Empreiteira)', dias: 145, valor: '15000' },
    { nome: 'Joana Martins (Clínica)', dias: 92, valor: '8500' },
    { nome: 'Roberto Alves (Varejo)', dias: 45, valor: '3200' },
  ];

  const resetState = (novaAba) => {
    setAbaAtiva(novaAba);
    setResultado(null);
    setLoading(false);
  };

  // Funções Reais conectadas ao Firebase
  const handleGerarMensagem = async (cliente) => {
    setLoading(true); setResultado(null);
    try {
      const res = await fetch(`${BASE_URL}/gerarMensagem`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente: cliente.nome, diasSumido: cliente.dias, totalGasto: cliente.valor })
      });
      const data = await res.json();
      setResultado(data.mensagem || data.erro || JSON.stringify(data));
    } catch (e) {
      setResultado(`Erro de conexão: ${e.message}`);
    }
    setLoading(false);
  };

  const handleAnalisarConcorrente = async () => {
    if (!concorrenteInput) return;
    setLoading(true); setResultado(null);
    try {
      // 1. Coletar
      setResultado("⏳ Extraindo posts do Instagram (Apify)...");
      const r1 = await fetch(`${BASE_URL}/coletarConcorrentes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instagram: concorrenteInput, limite: 15 })
      });
      const data1 = await r1.json();
      if (data1.erro) throw new Error(data1.erro);
      
      // 2. Analisar
      setResultado(`⏳ Analisando ${data1.posts.length} posts coletados (Anthropic Claude)...`);
      const r2 = await fetch(`${BASE_URL}/analisarConcorrentes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concorrente: concorrenteInput, posts: data1.posts, modo: 'um' })
      });
      const data2 = await r2.json();
      setResultado(data2.analise || data2.erro || JSON.stringify(data2));
    } catch (e) {
      setResultado(`Erro: ${e.message}`);
    }
    setLoading(false);
  };

  const handleGerarPautas = async () => {
    setLoading(true); setResultado(null);
    try {
      const res = await fetch(`${BASE_URL}/gerarPautas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assunto: pautaTema, publico: pautaPublico, tom: 'autoridade' })
      });
      const data = await res.json();
      setResultado(data.pautas || data.erro || JSON.stringify(data));
    } catch (e) {
      setResultado(`Erro de conexão: ${e.message}`);
    }
    setLoading(false);
  };

  const handlePublicarIg = async () => {
    setLoading(true); setResultado(null);
    try {
      const res = await fetch(`${BASE_URL}/publicarInstagram`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagem: igImg, legenda: igLegenda })
      });
      const data = await res.json();
      if (data.ok) {
        setResultado(`Post publicado com sucesso! ID: ${data.id}`);
      } else {
        setResultado(data.erro || JSON.stringify(data));
      }
    } catch (e) {
      setResultado(`Erro de conexão: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.tabContainer}>
        <button style={{ ...styles.tab, ...(abaAtiva === 'recuperar' ? styles.tabActive : {}) }} onClick={() => resetState('recuperar')}>
          <Users size={18} /> Recuperar Clientes
        </button>
        <button style={{ ...styles.tab, ...(abaAtiva === 'concorrentes' ? styles.tabActive : {}) }} onClick={() => resetState('concorrentes')}>
          <Target size={18} /> Concorrentes
        </button>
        <button style={{ ...styles.tab, ...(abaAtiva === 'pautas' ? styles.tabActive : {}) }} onClick={() => resetState('pautas')}>
          <FileText size={18} /> Pautas IA
        </button>
        <button style={{ ...styles.tab, ...(abaAtiva === 'publicador' ? styles.tabActive : {}) }} onClick={() => resetState('publicador')}>
          <Camera size={18} /> Publicador IG
        </button>
      </div>

      {abaAtiva === 'recuperar' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Fila de Recuperação (CRM)</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
            Empresários que pararam de investir há mais de 30 dias.
          </p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>CLIENTE</th>
                  <th style={styles.th}>SUMIDO HÁ</th>
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
                    <td style={styles.td}>
                      <button style={{ ...styles.button, padding: '8px 12px', fontSize: '12px' }} onClick={() => handleGerarMensagem(c)}>
                        <Send size={14} /> Gerar Mensagem IA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {loading && <p style={{ color: 'var(--color-secondary)', marginTop: '20px' }}><Loader2 size={16} className="spin" /> Processando na nuvem...</p>}
          {resultado && (
            <div style={styles.resultadoBox}>
              <p style={{ color: 'var(--color-success)', fontWeight: 'bold', marginBottom: '8px' }}>Resposta da IA:</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{resultado}</p>
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'concorrentes' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Análise de Concorrentes (Apify + Anthropic)</h3>
          
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>@ do Instagram do Concorrente</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input type="text" placeholder="Ex: ibccoaching" style={{ ...styles.input, marginBottom: 0 }} value={concorrenteInput} onChange={e => setConcorrenteInput(e.target.value)} />
            <button style={{ ...styles.button, width: '200px' }} onClick={handleAnalisarConcorrente}>
              {loading ? <Loader2 size={18} /> : <Target size={18} />} Analisar
            </button>
          </div>

          {resultado && (
             <div style={styles.resultadoBox}>
             <p style={{ color: 'var(--color-success)', fontWeight: 'bold', marginBottom: '12px' }}>Diagnóstico:</p>
             <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{resultado}</div>
           </div>
          )}
        </div>
      )}

      {abaAtiva === 'pautas' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Gerador de Pautas IA</h3>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Tema Central</label>
          <input type="text" placeholder="Ex: Como delegar tarefas sem perder o controle" style={styles.input} value={pautaTema} onChange={e => setPautaTema(e.target.value)} />

          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Público Alvo</label>
          <input type="text" placeholder="Ex: Donos de supermercados" style={styles.input} value={pautaPublico} onChange={e => setPautaPublico(e.target.value)} />

          <button style={styles.button} onClick={handleGerarPautas}>
            {loading ? <Loader2 size={18} /> : <FileText size={18} />} Gerar Pauta
          </button>

          {resultado && (
             <div style={styles.resultadoBox}>
             <p style={{ color: 'var(--color-success)', fontWeight: 'bold', marginBottom: '12px' }}>Conteúdo Gerado:</p>
             <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{resultado}</div>
           </div>
          )}
        </div>
      )}

      {abaAtiva === 'publicador' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Publicar no Instagram</h3>
          
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>URL da Imagem</label>
          <input type="text" placeholder="https://..." style={styles.input} value={igImg} onChange={e => setIgImg(e.target.value)} />

          <label style={{ display: 'block', color: 'var(--color-text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Legenda do Post</label>
          <textarea placeholder="Escreva a legenda aqui..." style={styles.textarea} value={igLegenda} onChange={e => setIgLegenda(e.target.value)}></textarea>

          <button style={styles.button} onClick={handlePublicarIg}>
            {loading ? <Loader2 size={18} /> : <Send size={18} />} Publicar Agora
          </button>

          {resultado && (
             <div style={styles.resultadoBox}>
             <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{resultado}</div>
           </div>
          )}
        </div>
      )}

    </div>
  );
}
