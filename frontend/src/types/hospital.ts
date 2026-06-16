import { REAL_HOSPITALS } from '../data/hospitals';

export type Hospital = (typeof REAL_HOSPITALS)[number];
export type HospitalType = 'Government' | 'Private';

export interface FilterOption {
  label: string;
  value: string;
  count: number;
}