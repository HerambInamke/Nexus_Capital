
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
import { TransactionService } from '../../services/transaction.service';

// Define category options
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

@Component({
  selector: 'app-new-entry-dialog',
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
  templateUrl: './new-entry-dialog.component.html',
  styleUrls: ['./new-entry-dialog.component.css']
})
export class NewEntryDialogComponent {
  newEntryForm: FormGroup;
  email: string;
  categoryOptions = CATEGORY_OPTIONS;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private transactionService: TransactionService
  ) {
    this.email = data.email;
    this.newEntryForm = this.fb.group({
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      description: ['', [
        Validators.required, 
        Validators.minLength(10), 
        Validators.maxLength(200)
      ]],
      date: [new Date(), Validators.required]
    });
  }

  onSubmit() {
    if (this.newEntryForm.valid) {
      const newEntry = {
        category: this.newEntryForm.get('category')?.value,
        amount: this.newEntryForm.get('amount')?.value,
        description: this.newEntryForm.get('description')?.value,
        date: this.newEntryForm.get('date')?.value.toISOString()
      };
      
      this.transactionService.addTransaction(
        this.email, 
        newEntry.category, 
        newEntry.amount, 
        newEntry.description,
        newEntry.date
      )
        .subscribe(
          (res) => {
            this.dialogRef.close({
              ...newEntry,
              entryId: res._id 
            });
          }
        );
    }
  }
}
