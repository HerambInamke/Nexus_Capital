export interface Budget {
  _id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  alerts: boolean;
  alertThreshold: number;
}