import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SavingsService } from '../../services/savings.service';
import { SavingsGoal } from '../../models/savings.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-savings-trends',
  templateUrl: './savings-trends.component.html',
  styleUrls: ['./savings-trends.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule]
})
export class SavingsTrendsComponent implements OnInit {
  @ViewChild('savingsProgressChart') savingsProgressChartRef!: ElementRef;
  @ViewChild('savingsTargetChart') savingsTargetChartRef!: ElementRef;
  savingsGoals: SavingsGoal[] = [];
  totalTarget: number = 0;
  totalSaved: number = 0;
  private savingsProgressChart: Chart | null = null;
  private savingsTargetChart: Chart | null = null;

  constructor(private savingsService: SavingsService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadSavingsGoals();
  }

  loadSavingsGoals() {
    this.savingsService.getSavingsGoals(localStorage.getItem('email') || '').subscribe({
      next: (goals) => {
        this.savingsGoals = goals;
        this.calculateTrends();
      },
      error: (error) => {
        console.error('Failed to load savings goals:', error);
      }
    });
  }

  calculateTrends() {
    this.totalTarget = this.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    this.totalSaved = this.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    this.renderSavingsProgressChart();
    this.renderSavingsTargetChart();
  }

  private renderSavingsProgressChart() {
    if (this.savingsProgressChart) {
      this.savingsProgressChart.destroy();
    }

    const ctx = this.savingsProgressChartRef.nativeElement;
    this.savingsProgressChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Saved', 'Remaining'],
        datasets: [{
          data: [this.totalSaved, Math.max(0, this.totalTarget - this.totalSaved)],
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
            text: 'Total Savings Progress'
          }
        }
      }
    });
  }

  private renderSavingsTargetChart() {
    if (this.savingsTargetChart) {
      this.savingsTargetChart.destroy();
    }

    const achievedGoals = this.savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
    const inProgressGoals = this.savingsGoals.length - achievedGoals;

    const ctx = this.savingsTargetChartRef.nativeElement;
    this.savingsTargetChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Achieved Goals', 'In Progress'],
        datasets: [{
          data: [achievedGoals, inProgressGoals],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: {
            display: true,
            text: 'Savings Goals Achievement'
          }
        }
      }
    });
  }
} 