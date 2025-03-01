import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ArcElement, CategoryScale, Title, Tooltip, Legend, registerables, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-finances-trends',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './finances-trends.component.html',
  styleUrls: ['./finances-trends.component.css']
})
export class FinancesTrendsComponent implements OnInit {
  @ViewChild('categoryDistributionChart') categoryDistributionChartRef!: ElementRef;

  categoryDistribution: { [key: string]: number } = {};
  totalSpending: number = 0;
  Object = Object;
  selectedInterval: 'month' | 'quarter' | 'year' | 'overall' = 'month';

  private categoryChart: Chart | null = null;

  private transactions!: Transaction[];

  constructor(private transactionService: TransactionService) {
    Chart.register(ArcElement, CategoryScale, Title, Tooltip, Legend);
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.transactionService.getTransactions(localStorage.getItem("email") || '').subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.analyzeCategorySpending(this.selectedInterval);
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.renderCategoryDistributionChart();
    }, 100);
  }

  updateAnalysis(interval: 'month' | 'quarter' | 'year' | 'overall') {
    this.selectedInterval = interval;
    this.analyzeCategorySpending(interval);
  }

  private analyzeCategorySpending(interval: 'month' | 'quarter' | 'year' | 'overall') {
    const filteredTransactions = this.filterTransactionsByInterval(interval);
    this.categoryDistribution = this.calculateCategoryDistribution(filteredTransactions);
    this.totalSpending = Object.values(this.categoryDistribution).reduce((a, b) => a + b, 0);
    this.renderCategoryDistributionChart();
  }
  

  private calculateCategoryDistribution(transactions: Transaction[]): { [key: string]: number } {
    return transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as { [key: string]: number });
  }

  private filterTransactionsByInterval(interval: 'month' | 'quarter' | 'year' | 'overall'): Transaction[] {
    if (!this.transactions) return [];
    
    const now = new Date();
    const startOfPeriod = new Date();
  
    switch (interval) {
      case 'month':
        startOfPeriod.setDate(1);
        break;
      case 'quarter':
        const currentMonth = now.getMonth();
        const startOfQuarter = currentMonth - (currentMonth % 3);
        startOfPeriod.setMonth(startOfQuarter, 1);
        break;
      case 'year':
        startOfPeriod.setMonth(0, 1);
        break;
      case 'overall':
        return this.transactions; // No filtering for overall
    }
  
    return this.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startOfPeriod;
    });
  }
  

  calculatePercentage(amount: number): string {
    if (this.totalSpending === 0) return '0.0';
    return ((amount / this.totalSpending) * 100).toFixed(1);
  }

  getHighestSpendingCategory(): string {
    if (Object.keys(this.categoryDistribution).length === 0) return 'None';
    return Object.entries(this.categoryDistribution)
      .reduce((a, b) => b[1] > a[1] ? b : a)[0];
  }

  private renderCategoryDistributionChart() {
    if (!this.categoryDistributionChartRef || !this.categoryDistributionChartRef.nativeElement) return;

    const ctx = this.categoryDistributionChartRef.nativeElement;

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    this.categoryChart = new Chart(ctx, {
      type: 'pie', 
      data: {
        labels: Object.keys(this.categoryDistribution),
        datasets: [{
          data: Object.values(this.categoryDistribution),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',   // Groceries
            'rgba(54, 162, 235, 0.6)',   // Dining Out
            'rgba(255, 206, 86, 0.6)',   // Utilities
            'rgba(75, 192, 192, 0.6)',   // Entertainment
            'rgba(153, 102, 255, 0.6)',   // Transportation
            'rgba(255, 159, 64, 0.6)',   // Other
            'rgba(199, 199, 199, 0.6)'   // Additional color
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Spending by Category'
          }
        }
      }
    });
  }
}