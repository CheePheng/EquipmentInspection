// Shared chart theme — single source of truth for Recharts styling
// Replaces hardcoded values in SupervisorDashboard

import type { CSSProperties } from 'react';

export const chartColors = {
  primary: '#F5A623',
  primaryFaded: 'rgba(245, 166, 35, 0.25)',
  text: '#94A3B8',
  grid: '#334155',
  tooltip: '#1A2332',
  tooltipBorder: '#334155',
  background: '#0F1419',
};

export const severityChartColors = {
  critical: '#F87171',
  high: '#F97316',
  medium: '#FBBF24',
  low: '#6B7280',
} as const;

export const tooltipStyle: CSSProperties = {
  backgroundColor: chartColors.tooltip,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: '12px',
  color: '#E2E8F0',
  fontSize: 12,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
};

export const axisTickStyle = {
  fill: chartColors.text,
  fontSize: 11,
};

export const gridStyle = {
  strokeDasharray: '3 3',
  stroke: chartColors.grid,
  strokeOpacity: 0.3,
};
