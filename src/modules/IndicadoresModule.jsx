import React, { useState } from 'react';
import { Target, TrendingUp, Users, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const styles = {
  container: { width: '100%' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' },
  statCard: {
    backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px'
  },
  statLabel: { color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
  statValue: { fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-primary)' },
  card: {
    backgroundColor: 'var(--color-surface)', borderRadius: '8px', padding: '24px', border: '1px solid var(--color-border)', marginBottom: '24px'
  },
  cardTitle: { color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' },
};

const mockDataMetas = [
  { mes: 'Jan', vendas: 40000, meta: 50000 },
  { mes: 'Fev', vendas: 45000, meta: 50000 },
  { mes: 'Mar', vendas: 60000, meta: 60000 },
  { mes: 'Abr', vendas: 80000, meta: 70000 },
  { mes: 'Mai', vendas: 75000, meta: 80000 },
  { mes: 'Jun', vendas: 90000, meta: 90000 },
  { mes: 'Jul', vendas: 120000, meta: 100000 },
];

export default function IndicadoresModule() {
  return (
    <div style={styles.container}>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}><Users size={16} color="var(--color-secondary)" /> Alunos Formados (Ano)</div>
          <div style={styles.statValue}>1.240</div>
          <div style={{ color: 'var(--color-success)', fontSize: '12px', marginTop: '8px' }}>+15% vs ano passado</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}><Award size={16} color="var(--color-secondary)" /> NPS Médio</div>
          <div style={styles.statValue}>9.4</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '8px' }}>Zona de Excelência</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}><Target size={16} color="var(--color-secondary)" /> Mentorias Ativas</div>
          <div style={styles.statValue}>42</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '8px' }}>Capacidade 85%</div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Evolução de Vendas vs Meta (2026)</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <AreaChart data={mockDataMetas} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Area type="monotone" dataKey="vendas" name="Realizado" stroke="var(--color-secondary)" fillOpacity={1} fill="url(#colorVendas)" />
              <Area type="step" dataKey="meta" name="Meta" stroke="var(--color-text-muted)" fill="none" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
