import type { ReactNode } from 'react';

export interface KpiItem {
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  icon: ReactNode;
}

export interface ActivityItem {
  id: number;
  name: string;
  email: string;
  action: string;
  when: string;
  badge: { variant: 'success' | 'warning' | 'neutral'; label: string };
}

export interface QuickStatItem {
  label: string;
  value: string;
  delta: number;
  icon: ReactNode;
}
