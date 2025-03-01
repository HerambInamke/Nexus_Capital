import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { BudgetService } from '../../services/budget.service';

const CATEGORY_OPTIONS = [
  'Groceries', 
  'Utilities', 
  'Entertainment', 
  'Dining', 
  'Transportation', 
  'Shopping', 
  'Health', 
  'Education', 
  'Miscellaneous'
];

const PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

@Component({
  selector: 'app-new-budget-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './new-budget-dialog.component.html',
  styleUrls: ['./new-budget-dialog.component.css']
})
export class NewBudgetDialogComponent {
  budgetForm: FormGroup;
  email: string;
  categoryOptions = CATEGORY_OPTIONS;
  periodOptions = PERIOD_OPTIONS;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewBudgetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private budgetService: BudgetService
  ) {
    this.email = data.email;
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      period: ['monthly', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [this.calculateEndDate(new Date(), 'monthly'), Validators.required],
      alerts: [true],
      alertThreshold: [80, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    // Update end date when period or start date changes
    this.budgetForm.get('period')?.valueChanges.subscribe(period => {
      const startDate = this.budgetForm.get('startDate')?.value;
      if (startDate) {
        this.budgetForm.get('endDate')?.setValue(this.calculateEndDate(startDate, period));
      }
    });

    this.budgetForm.get('startDate')?.valueChanges.subscribe(date => {
      if (date) {
        const period = this.budgetForm.get('period')?.value;
        this.budgetForm.get('endDate')?.setValue(this.calculateEndDate(date, period));
      }
    });
  }

  calculateEndDate(startDate: Date, period: string): Date {
    const endDate = new Date(startDate);
    
    switch (period) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    
    return endDate;
  }

  onSubmit() {
    if (this.budgetForm.valid) {
      const newBudget = {
        ...this.budgetForm.value,
        spent: 0 // Initialize spent amount to 0
      };
      
      this.budgetService.addBudget(this.email, newBudget)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error adding budget:', error);
          }
        });
    }
  }
}