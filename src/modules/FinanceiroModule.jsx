import React, { useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const styles = {
  container: { width: '100%' },
  tabContainer: { 
    display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px'
  },
  tab: {
    padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)',
    cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap'
  },
  tabActive: {
    backgroundColor: 'var(--color-secondary)', borderColor: 'var(--color-secondary)', color: '#000',
  },
  filterRow: {
    display: 'flex', gap: '12px', marginBottom: '24px',
    backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)'
  },
  select: {
    padding: '8px 12px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)',
    borderRadius: '4px', color: 'var(--color-text-primary)', outline: 'none', flex: 1
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' },
  statCard: {
    backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px'
  },
  statLabel: { color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: 'bold' },
  card: {
    backgroundColor: 'var(--color-surface)', borderRadius: '8px', padding: '24px', border: '1px solid var(--color-border)', marginBottom: '24px'
  },
  cardTitle: { color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' },
  listRow: {
    display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)'
  },
  listName: { color: 'var(--color-text-secondary)', fontSize: '14px' },
  listValue: { color: 'var(--color-text-primary)', fontWeight: 'bold', fontSize: '14px' }
};

const mockDataChart = [
  { name: 'Cursos On', receita: 40000, custo: 12000 },
  { name: 'Mentoria Ind.', receita: 30000, custo: 5000 },
  { name: 'Imersão Pres.', receita: 85000, custo: 45000 },
  { name: 'Livros', receita: 5000, custo: 2000 },
];

export default function FinanceiroModule() {
  const [aba, setAba] = useState('dre');

  return (
    <div style={styles.container}>
      
      <div style={styles.tabContainer}>
        <button style={{...styles.tab, ...(aba === 'dre' ? styles.tabActive : {})}} onClick={() => setAba('dre')}>DRE</button>
        <button style={{...styles.tab, ...(aba === 'fluxo' ? styles.tabActive : {})}} onClick={() => setAba('fluxo')}>Fluxo de caixa</button>
        <button style={{...styles.tab, ...(aba === 'patrimonio' ? styles.tabActive : {})}} onClick={() => setAba('patrimonio')}>Patrimônio</button>
      </div>

      <div style={styles.filterRow}>
        <select style={styles.select}>
          <option>Setembro</option>
          <option>Outubro</option>
        </select>
        <select style={styles.select}>
          <option>2026</option>
          <option>2025</option>
        </select>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Receita Líquida (Vendas totais)</div>
          <div style={{ ...styles.statValue, color: 'var(--color-success)' }}>R$ 160.000</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Custo Total (Operação + Marketing)</div>
          <div style={{ ...styles.statValue, color: 'var(--color-danger)' }}>R$ 64.000</div>
        </div>
      </div>

      <div style={{ ...styles.statCard, marginBottom: '24px', backgroundColor: 'rgba(168, 134, 80, 0.1)', borderColor: 'var(--color-secondary)' }}>
        <div style={{ color: 'var(--color-secondary)', fontSize: '13px', marginBottom: '8px' }}>Lucro do período</div>
        <div style={{ ...styles.statValue, color: 'var(--color-secondary)' }}>R$ 96.000 <span style={{fontSize:'14px', marginLeft:'8px'}}>margem 60%</span></div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Para onde vai o dinheiro</h3>
        <div style={styles.listRow}>
          <span style={styles.listName}>CMV (Materiais didáticos, Infra de eventos)</span>
          <span style={styles.listValue}>R$ 24.000 - 37.5%</span>
        </div>
        <div style={styles.listRow}>
          <span style={styles.listName}>Folha de pagamento (Equipe de Suporte e Vendas)</span>
          <span style={styles.listValue}>R$ 20.000 - 31.2%</span>
        </div>
        <div style={styles.listRow}>
          <span style={styles.listName}>Marketing (Anúncios Tráfego Pago)</span>
          <span style={styles.listValue}>R$ 15.000 - 23.4%</span>
        </div>
        <div style={styles.listRow}>
          <span style={styles.listName}>Custo Administrativo (Software, Contabilidade)</span>
          <span style={styles.listValue}>R$ 5.000 - 7.8%</span>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Receitas e Custos por Produto — Setembro</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={mockDataChart} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                itemStyle={{ color: 'var(--color-text-secondary)' }}
              />
              <Bar dataKey="receita" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="custo" fill="var(--color-danger)" radius={[4, 4, 0, 0]} name="Custo" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
