export interface Account {
  _id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit' | 'digital';
  balance: number;
  currency: string;
  isDebt: boolean;
  interestRate?: number;
  dueDate?: Date;
  minimumPayment?: number;
  creditLimit?: number;
}