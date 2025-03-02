import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-budget-trends',
  templateUrl: './budget-trends.component.html',
  styleUrls: ['./budget-trends.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule]
})
export class BudgetTrendsComponent implements OnInit {
  @ViewChild('budgetChart') budgetChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('budgetCrossingChart') budgetCrossingChartRef!: ElementRef;
  budgets: Budget[] = [];
  totalBudgeted: number = 0;
  totalSpent: number = 0;
  private budgetChart: Chart | null = null;
  private categoryChart: Chart | null = null;
  private budgetCrossingChart: Chart | null = null;

  constructor(private budgetService: BudgetService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadBudgets();
  }

  loadBudgets() {
    this.budgetService.getBudgets(localStorage.getItem('email') || '').subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        this.calculateTrends();
      },
      error: (error) => {
        console.error('Failed to load budgets:', error);
      }
    });
  }

  calculateTrends() {
    this.totalBudgeted = this.budgets.reduce((sum, budget) => sum + budget.amount, 0);
    this.totalSpent = this.budgets.reduce((sum, budget) => sum + budget.spent, 0);
    this.renderBudgetChart();
    this.renderCategoryChart();
    this.renderBudgetCrossingChart();
  }

  private renderBudgetChart() {
    if (this.budgetChart) {
      this.budgetChart.destroy();
    }

    const ctx = this.budgetChartRef.nativeElement;

    this.budgetChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Budgeted', 'Total Spent'],
        datasets: [{
          label: 'Amount',
          data: [this.totalBudgeted, this.totalSpent],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: {
            display: true,
            text: 'Budget Trends'
          }
        }
      }
    });
  }

  private renderCategoryChart() {
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    const categoryData = this.budgets.reduce((acc: { [key: string]: number }, budget) => {
      acc[budget.category] = (acc[budget.category] || 0) + budget.amount;
      return acc;
    }, {});

    const ctx = this.categoryChartRef.nativeElement;
    this.categoryChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(categoryData),
        datasets: [{
          data: Object.values(categoryData),
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
            text: 'Category-wise Budget Distribution'
          }
        }
      }
    });
  }

  private renderBudgetCrossingChart() {
    if (this.budgetCrossingChart) {
      this.budgetCrossingChart.destroy();
    }

    const withinBudget = this.budgets.filter(b => b.spent <= b.amount).length;
    const overBudget = this.budgets.filter(b => b.spent > b.amount).length;

    const ctx = this.budgetCrossingChartRef.nativeElement;
    this.budgetCrossingChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Within Budget', 'Over Budget'],
        datasets: [{
          data: [withinBudget, overBudget],
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
            text: 'Budget Compliance'
          }
        }
      }
    });
  }
} 