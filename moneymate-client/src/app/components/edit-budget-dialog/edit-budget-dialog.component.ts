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
import { Budget } from '../../models/budget.model';
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
  selector: 'app-edit-budget-dialog',
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
  templateUrl: './edit-budget-dialog.component.html',
  styleUrls: ['./edit-budget-dialog.component.css']
})
export class EditBudgetDialogComponent {
  budgetForm: FormGroup;
  categoryOptions = CATEGORY_OPTIONS;
  periodOptions = PERIOD_OPTIONS;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditBudgetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string; budget: Budget },
    private budgetService: BudgetService
  ) {
    this.budgetForm = this.fb.group({
      category: [data.budget.category || '', Validators.required],
      amount: [data.budget.amount || '', [Validators.required, Validators.min(1)]],
      spent: [data.budget.spent || 0, [Validators.required, Validators.min(0)]],
      period: [data.budget.period || 'monthly', Validators.required],
      startDate: [new Date(data.budget.startDate) || new Date(), Validators.required],
      endDate: [new Date(data.budget.endDate) || this.calculateEndDate(new Date(), 'monthly'), Validators.required],
      alerts: [data.budget.alerts !== undefined ? data.budget.alerts : true],
      alertThreshold: [data.budget.alertThreshold || 80, [Validators.required, Validators.min(1), Validators.max(100)]]
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
      const updatedBudget = {
        ...this.budgetForm.value
      };
      
      this.budgetService.updateBudget(this.data.budget._id, updatedBudget)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error updating budget:', error);
          }
        });
    }
  }
}