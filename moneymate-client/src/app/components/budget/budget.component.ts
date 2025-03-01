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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Budget } from '../../models/budget.model';
import { BudgetService } from '../../services/budget.service';
import { NewBudgetDialogComponent } from '../new-budget-dialog/new-budget-dialog.component';
import { EditBudgetDialogComponent } from '../edit-budget-dialog/edit-budget-dialog.component';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    MatIcon, MatPaginator, MatSort, MatProgressSpinner,
    MatCard, MatCardContent, MatTableModule, CommonModule,
    MatButton, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatInputModule, MatSlideToggleModule, MatTooltipModule
  ],
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {
  displayedColumns: string[] = ['category', 'amount', 'spent', 'progress', 'period', 'alerts', 'actions'];
  dataSource!: MatTableDataSource<Budget>;
  loading = false;
  errorMessage = '';

  filterForm = new FormGroup({
    category: new FormControl(''),
    period: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categories = [
    'Groceries', 'Utilities', 'Entertainment',
    'Dining', 'Transportation', 'Other'
  ];

  periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private budgetService: BudgetService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.loadBudgets();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadBudgets() {
    this.budgetService.getBudgets(localStorage.getItem('email') || '')
      .subscribe({
        next: (budgets) => {
          this.dataSource = new MatTableDataSource(budgets);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load budgets. Please try again later.';
          this.loading = false;
          console.error(error);
        }
      });
  }

  applyFilters() {
    if (!this.dataSource) return;
    
    this.dataSource.filterPredicate = (data: Budget, filter: string) => {
      const selectedCategory = this.filterForm.get('category')?.value;
      const selectedPeriod = this.filterForm.get('period')?.value;
      
      let matchesCategory = true;
      let matchesPeriod = true;
      
      if (selectedCategory) {
        matchesCategory = data.category === selectedCategory;
      }
      
      if (selectedPeriod) {
        matchesPeriod = data.period === selectedPeriod;
      }
      
      return matchesCategory && matchesPeriod;
    };
    
    this.dataSource.filter = Math.random().toString(); // Trigger filter
  }

  getProgressPercentage(budget: Budget): number {
    return Math.min(100, (budget.spent / budget.amount) * 100);
  }

  getProgressColor(budget: Budget): string {
    const percentage = this.getProgressPercentage(budget);
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    return 'green';
  }

  addBudget() {
    const dialogRef = this.dialog.open(NewBudgetDialogComponent, {
      width: '500px',
      data: { email: localStorage.getItem('email') || '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Budget added successfully', 'Close', {
          duration: 3000
        });
        this.loadBudgets();
      }
    });
  }

  editBudget(budget: Budget) {
    const dialogRef = this.dialog.open(EditBudgetDialogComponent, {
      width: '500px',
      data: {
        email: localStorage.getItem('email') || '',
        budget: budget
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Budget updated successfully', 'Close', {
          duration: 3000
        });
        this.loadBudgets();
      }
    });
  }

  deleteBudget(budgetId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this budget?');
    if (confirmDelete) {
      this.budgetService.deleteBudget(budgetId, localStorage.getItem('email') || '')
        .subscribe({
          next: () => {
            this.snackBar.open('Budget deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadBudgets();
          },
          error: (error) => {
            this.snackBar.open('Failed to delete budget', 'Close', {
              duration: 3000
            });
            console.error(error);
          }
        });
    }
  }
}