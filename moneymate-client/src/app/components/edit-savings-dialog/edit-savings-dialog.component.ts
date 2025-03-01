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
import { SavingsGoal } from '../../models/savings.model';
import { SavingsService } from '../../services/savings.service';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

@Component({
  selector: 'app-edit-savings-dialog',
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
  templateUrl: './edit-savings-dialog.component.html',
  styleUrls: ['./edit-savings-dialog.component.css']
})
export class EditSavingsDialogComponent {
  savingsForm: FormGroup;
  priorityOptions = PRIORITY_OPTIONS;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditSavingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string; goal: SavingsGoal },
    private savingsService: SavingsService
  ) {
    this.savingsForm = this.fb.group({
      name: [data.goal.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      targetAmount: [data.goal.targetAmount || '', [Validators.required, Validators.min(1)]],
      currentAmount: [data.goal.currentAmount || 0, [Validators.required, Validators.min(0)]],
      targetDate: [new Date(data.goal.targetDate) || new Date(), Validators.required],
      description: [data.goal.description || '', [Validators.maxLength(200)]],
      priority: [data.goal.priority || 'medium', Validators.required]
    });
  }

  onSubmit() {
    if (this.savingsForm.valid) {
      const updatedGoal = this.savingsForm.value;
      
      this.savingsService.updateSavingsGoal(this.data.goal._id, updatedGoal)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error updating savings goal:', error);
          }
        });
    }
  }
}