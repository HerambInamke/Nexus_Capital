import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SavingsGoal } from '../../models/savings.model';
import { SavingsService } from '../../services/savings.service';
import { NewSavingsDialogComponent } from '../new-savings-dialog/new-savings-dialog.component';
import { EditSavingsDialogComponent } from '../edit-savings-dialog/edit-savings-dialog.component';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [
    MatIcon, MatPaginator, MatSort, MatProgressSpinner,
    MatCard, MatCardContent, MatTableModule, CommonModule,
    MatButton, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatInputModule, MatTooltipModule
  ],
  templateUrl: './savings.component.html',
  styleUrls: ['./savings.component.css']
})
export class SavingsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'targetAmount', 'currentAmount', 'progress', 'targetDate', 'priority', 'actions'];
  dataSource!: MatTableDataSource<SavingsGoal>;
  loading = false;
  errorMessage = '';

  filterForm = new FormGroup({
    priority: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private savingsService: SavingsService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.loadSavingsGoals();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadSavingsGoals() {
    this.savingsService.getSavingsGoals(localStorage.getItem('email') || '')
      .subscribe({
        next: (goals) => {
          this.dataSource = new MatTableDataSource(goals);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load savings goals. Please try again later.';
          this.loading = false;
          console.error(error);
        }
      });
  }

  applyFilters() {
    if (!this.dataSource) return;
    
    this.dataSource.filterPredicate = (data: SavingsGoal, filter: string) => {
      const selectedPriority = this.filterForm.get('priority')?.value;
      
      if (selectedPriority) {
        return data.priority === selectedPriority;
      }
      
      return true;
    };
    
    this.dataSource.filter = Math.random().toString(); // Trigger filter
  }

  getProgressPercentage(goal: SavingsGoal): number {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  }

  getProgressColor(goal: SavingsGoal): string {
    const percentage = this.getProgressPercentage(goal);
    if (percentage >= 75) return 'green';
    if (percentage >= 50) return '#59c563';
    if (percentage >= 25) return 'orange';
    return 'red';
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'black';
    }
  }

  getRemainingDays(targetDate: Date): number {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  addSavingsGoal() {
    const dialogRef = this.dialog.open(NewSavingsDialogComponent, {
      width: '500px',
      data: { email: localStorage.getItem('email') || '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Savings goal added successfully', 'Close', {
          duration: 3000
        });
        this.loadSavingsGoals();
      }
    });
  }

  editSavingsGoal(goal: SavingsGoal) {
    const dialogRef = this.dialog.open(EditSavingsDialogComponent, {
      width: '500px',
      data: {
        email: localStorage.getItem('email') || '',
        goal: goal
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Savings goal updated successfully', 'Close', {
          duration: 3000
        });
        this.loadSavingsGoals();
      }
    });
  }

  deleteSavingsGoal(goalId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this savings goal?');
    if (confirmDelete) {
      this.savingsService.deleteSavingsGoal(goalId, localStorage.getItem('email') || '')
        .subscribe({
          next: () => {
            this.snackBar.open('Savings goal deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadSavingsGoals();
          },
          error: (error) => {
            this.snackBar.open('Failed to delete savings goal', 'Close', {
              duration: 3000
            });
            console.error(error);
          }
        });
    }
  }
}