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
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction.service';

const CATEGORY_OPTIONS = [
  'Groceries',
  'Utilities',
  'Entertainment',
  'Dining',
  'Transportation',
  'Shopping',
  'Health',
  'Education',
  'Miscellaneous',
];

@Component({
  selector: 'app-edit-entry-dialog',
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
    CommonModule,
  ],
  templateUrl: './edit-entry-dialog.component.html',
  styleUrl: './edit-entry-dialog.component.css',
})
export class EditEntryDialogComponent {
  newEntryForm: FormGroup;
  categoryOptions = CATEGORY_OPTIONS;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string; entry: Transaction },
    private transactionService: TransactionService
  ) {
    this.newEntryForm = this.fb.group({
      category: [data.entry.category || '', Validators.required],
      amount: [data.entry.amount || '', [Validators.required, Validators.min(0)]],
      description: [
        data.entry.description || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(200)],
      ],
      date: [new Date(data.entry.date) || new Date(), Validators.required],
    });
  }

  onSubmit() {
    if (this.newEntryForm.valid) {
      const updatedEntry = {
        ...this.data.entry, 
        category: this.newEntryForm.get('category')?.value,
        amount: this.newEntryForm.get('amount')?.value,
        description: this.newEntryForm.get('description')?.value,
        date: this.newEntryForm.get('date')?.value.toISOString(),
      };

      this.transactionService.editTransaction(
        updatedEntry._id,
        updatedEntry.category,
        updatedEntry.amount,
        updatedEntry.description,
        updatedEntry.date
      ).subscribe(() => {
        this.dialogRef.close(updatedEntry);
      });

    }
  }
}