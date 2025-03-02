import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-accounts-trends',
  templateUrl: './accounts-trends.component.html',
  styleUrls: ['./accounts-trends.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule]
})
export class AccountsTrendsComponent implements OnInit {
  @ViewChild('accountsChart') accountsChartRef!: ElementRef;
  @ViewChild('accountTypeChart') accountTypeChartRef!: ElementRef;
  @ViewChild('debtFulfillmentChart') debtFulfillmentChartRef!: ElementRef;
  accounts: Account[] = [];
  totalAssets: number = 0;
  totalDebts: number = 0;
  private accountsChart: Chart | null = null;
  private accountTypeChart: Chart | null = null;
  private debtFulfillmentChart: Chart | null = null;

  constructor(private accountService: AccountService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getAccounts(localStorage.getItem('email') || '').subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.calculateTrends();
      },
      error: (error) => {
        console.error('Failed to load accounts:', error);
      }
    });
  }

  calculateTrends() {
    this.totalAssets = this.accounts
      .filter(account => !account.isDebt)
      .reduce((sum, account) => sum + account.balance, 0);
    this.totalDebts = this.accounts
      .filter(account => account.isDebt)
      .reduce((sum, account) => sum + account.balance, 0);
    
    this.renderAccountsChart();
    this.renderAccountTypeChart();
    this.renderDebtFulfillmentChart();
  }

  private renderAccountsChart() {
    if (this.accountsChart) {
      this.accountsChart.destroy();
    }

    const ctx = this.accountsChartRef.nativeElement;

    this.accountsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Assets', 'Total Debts'],
        datasets: [{
          label: 'Amount',
          data: [this.totalAssets, this.totalDebts],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: {
            display: true,
            text: 'Accounts Trends'
          }
        }
      }
    });
  }

  private renderAccountTypeChart() {
    if (this.accountTypeChart) {
      this.accountTypeChart.destroy();
    }

    const accountTypeData = this.accounts.reduce((acc: { [key: string]: number }, account) => {
      acc[account.type] = (acc[account.type] || 0) + Math.abs(account.balance);
      return acc;
    }, {});

    const ctx = this.accountTypeChartRef.nativeElement;
    this.accountTypeChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(accountTypeData),
        datasets: [{
          data: Object.values(accountTypeData),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: {
            display: true,
            text: 'Account Type Distribution'
          }
        }
      }
    });
  }

  private renderDebtFulfillmentChart() {
    if (this.debtFulfillmentChart) {
      this.debtFulfillmentChart.destroy();
    }

    const debtAccounts = this.accounts.filter(account => account.isDebt);
    const totalDebtLimit = debtAccounts.reduce((sum, account) => sum + (account.creditLimit || 0), 0);
    const remainingDebt = debtAccounts.reduce((sum, account) => sum + account.balance, 0);
    const paidDebt = totalDebtLimit - remainingDebt;

    const ctx = this.debtFulfillmentChartRef.nativeElement;
    this.debtFulfillmentChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Paid Off', 'Remaining Debt'],
        datasets: [{
          data: [paidDebt, remainingDebt],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: {
            display: true,
            text: 'Debt Fulfillment Status'
          }
        }
      }
    });
  }
} 