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
import { CommonModule } from '@angular/common';
import { SavingsService } from '../../services/savings.service';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

@Component({
  selector: 'app-new-savings-dialog',
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
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './new-savings-dialog.component.html',
  styleUrls: ['./new-savings-dialog.component.css']
})
export class NewSavingsDialogComponent {
  savingsForm: FormGroup;
  email: string;
  priorityOptions = PRIORITY_OPTIONS;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewSavingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private savingsService: SavingsService
  ) {
    this.email = data.email;
    
    // Calculate default target date (3 months from now)
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 3);
    
    this.savingsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      targetAmount: ['', [Validators.required, Validators.min(1)]],
      currentAmount: [0, [Validators.required, Validators.min(0)]],
      targetDate: [targetDate, Validators.required],
      description: ['', [Validators.maxLength(200)]],
      priority: ['medium', Validators.required]
    });
  }

  onSubmit() {
    if (this.savingsForm.valid) {
      const newGoal = this.savingsForm.value;
      
      this.savingsService.addSavingsGoal(this.email, newGoal)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error adding savings goal:', error);
          }
        });
    }
  }
}