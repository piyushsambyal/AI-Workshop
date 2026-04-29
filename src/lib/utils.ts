import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CHART_TYPES = [
  'line',
  'bar',
  'area',
  'horizontalBar',
  'pie',
  'donut',
  'scatter',
  'radar',
] as const;

export type ChartType = typeof CHART_TYPES[number];

export interface DataPoint {
  id: string;
  label: string;
  value: number;
}

export interface Dataset {
  id: string;
  name: string;
  color: string;
  data: DataPoint[];
}

export interface DashboardState {
  datasets: Dataset[];
  labels: string[];
  activeChartType: ChartType;
  selectedDatasetId: string;
}

export const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function calculateStats(data: number[]) {
  if (data.length === 0) return { total: 0, average: 0, max: 0, min: 0, count: 0 };
  const total = data.reduce((acc, val) => acc + val, 0);
  return {
    total,
    average: total / data.length,
    max: Math.max(...data),
    min: Math.min(...data),
    count: data.length,
  };
}
