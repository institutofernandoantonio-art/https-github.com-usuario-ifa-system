import React, { useState } from 'react';
import { MessageSquare, Send, CheckSquare, Square, Loader2, Info } from 'lucide-react';

const BASE_URL = 'https://us-central1-ifa-marketing-system-24.cloudfunctions.net';

const styles = {
  container: { width: '100%' },
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
    fontSize: '20px', 
    fontWeight: '600', 
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
    marginTop: '24px'
  },
  statBox: {
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    color: 'var(--color-text-muted)',
    fontSize: '13px',
    marginBottom: '8px'
  },
  statValue: {
    color: 'var(--color-text-primary)',
    fontSize: '28px',
    fontWeight: 'bold'
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px'
  },
  buttonPrimary: {
    backgroundColor: 'var(--color-secondary)',
    color: '#000',
    border: 'none',
    padding: '8px 24px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    padding: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  },
  checkboxWrapper: {
    color: 'var(--color-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  itemName: {
    color: 'var(--color-text-primary)',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '4px'
  },
  itemMeta: {
    color: 'var(--color-text-muted)',
    fontSize: '12px'
  },
  metaHighlight: {
    color: 'var(--color-secondary)',
    fontWeight: '600'
  }
};

export default function PesquisasModule() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Estado dos checkboxes (IDs selecionados)
  const [selecionados, setSelecionados] = useState([]);

  // Mock de clientes da base
  const [clientesBase] = useState([
    { id: '1', nome: 'CARLINDA SOARES PEREIRA LTDA', compras: 52, valor: '38.385,00', fone: '(64) 99340-6227' },
    { id: '2', nome: 'Coop Agro de Desenvolvimento de Goias', compras: 21, valor: '33.861,23', fone: '(64) 98434-1006' },
    { id: '3', nome: 'MARIA LAURA LEMOS DA SILVA', compras: 123, valor: '31.964,10', fone: '(64) 99238-4633' },
    { id: '4', nome: 'Varandas Palace Hotel Ltda', compras: 154, valor: '24.106,00', fone: '(64) 99244-1122' },
    { id: '5', nome: 'RODOLANCHES LTDA', compras: 74, valor: '20.417,00', fone: '(64) 98122-3344' },
    { id: '6', nome: 'Livia Garcia Martins Honorato Ltda', compras: 88, valor: '18.399,00', fone: '(64) 99211-9988' },
  ]);

  const handleToggle = (id) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const marcarN = (n) => {
    const ids = clientesBase.slice(0, n).map(c => c.id);
    setSelecionados(ids);
  };

  const dispararPesquisas = async () => {
    if (selecionados.length === 0) return;
    setLoading(true);
    setResultado(null);

    const clientesParaEnviar = clientesBase.filter(c => selecionados.includes(c.id));
    
    let sucessos = 0;
    let falhas = 0;

    // Envia um por um (na vida real isso estaria num batch ou enviando um array)
    for (const c of clientesParaEnviar) {
      try {
        const res = await fetch(`${BASE_URL}/enviarPesquisa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cliente: c.nome, 
            whatsapp_e164: c.fone.replace(/\D/g, ''),
            quem: 'Admin'
          })
        });
        const data = await res.json();
        if (data.ok) sucessos++;
        else falhas++;
      } catch (e) {
        falhas++;
      }
    }

    setLoading(false);
    setResultado(`Disparo concluído: ${sucessos} enviados com sucesso, ${falhas} falhas.`);
    setSelecionados([]); // Limpa a seleção
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <MessageSquare size={24} /> Pesquisa de Satisfação (NPS)
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Uma pergunta no WhatsApp: de 0 a 10, o quanto o cliente recomendaria a metodologia IFA de autonomia empresarial.
        </p>

        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Podem receber</div>
            <div style={styles.statValue}>{clientesBase.length}</div>
          </div>
          <div style={{ ...styles.statBox, borderColor: selecionados.length > 0 ? 'var(--color-secondary)' : 'var(--color-border)' }}>
            <div style={styles.statLabel}>Selecionados</div>
            <div style={{ ...styles.statValue, color: selecionados.length > 0 ? 'var(--color-secondary)' : 'var(--color-text-primary)' }}>
              {selecionados.length}
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Já procurados (90d)</div>
            <div style={styles.statValue}>14</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(47, 128, 237, 0.1)', padding: '12px', borderRadius: '4px', color: 'var(--color-info)', fontSize: '13px', display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>O envio em massa requer aquecimento do chip. Comece enviando 5 a 10 por dia nas primeiras duas semanas para não correr risco de banimento.</span>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.buttonOutline} onClick={() => marcarN(5)}>Marcar 5 maiores</button>
          <button style={styles.buttonOutline} onClick={() => marcarN(10)}>Marcar 10 maiores</button>
          <button style={styles.buttonOutline} onClick={() => setSelecionados([])}>Limpar</button>
          
          <button 
            style={{ ...styles.buttonPrimary, opacity: selecionados.length === 0 ? 0.5 : 1 }}
            disabled={selecionados.length === 0 || loading}
            onClick={dispararPesquisas}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />} 
            Enviar para {selecionados.length} clientes
          </button>
        </div>

        {resultado && (
          <div style={{ padding: '16px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '4px', marginBottom: '24px' }}>
            <p style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>{resultado}</p>
          </div>
        )}

        <div style={styles.listContainer}>
          {clientesBase.map(cliente => (
            <div 
              key={cliente.id} 
              style={{ ...styles.listItem, borderColor: selecionados.includes(cliente.id) ? 'var(--color-secondary)' : 'var(--color-border)' }}
              onClick={() => handleToggle(cliente.id)}
            >
              <div style={styles.checkboxWrapper}>
                {selecionados.includes(cliente.id) ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
              <div style={styles.itemDetails}>
                <div style={styles.itemName}>{cliente.nome}</div>
                <div style={styles.itemMeta}>
                  {cliente.compras} compra(s) - R$ {cliente.valor} - <span style={styles.metaHighlight}>{cliente.fone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
