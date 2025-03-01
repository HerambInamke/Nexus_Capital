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
import { AccountService } from '../../services/account.service';

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'digital', label: 'Digital Wallet' }
];

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' }
];

@Component({
  selector: 'app-new-account-dialog',
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
  templateUrl: './new-account-dialog.component.html',
  styleUrls: ['./new-account-dialog.component.css']
})
export class NewAccountDialogComponent {
  accountForm: FormGroup;
  email: string;
  accountTypes = ACCOUNT_TYPES;
  currencies = CURRENCIES;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private accountService: AccountService
  ) {
    this.email = data.email;
    
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      type: ['bank', Validators.required],
      balance: [0, [Validators.required]],
      currency: ['USD', Validators.required],
      isDebt: [false],
      interestRate: [null],
      dueDate: [null],
      minimumPayment: [null],
      creditLimit: [null]
    });

    // Show/hide fields based on account type and isDebt
    this.accountForm.get('type')?.valueChanges.subscribe(type => {
      this.updateFormValidation();
    });

    this.accountForm.get('isDebt')?.valueChanges.subscribe(isDebt => {
      this.updateFormValidation();
    });
  }

  updateFormValidation() {
    const type = this.accountForm.get('type')?.value;
    const isDebt = this.accountForm.get('isDebt')?.value;
    
    // Reset validators
    this.accountForm.get('interestRate')?.clearValidators();
    this.accountForm.get('dueDate')?.clearValidators();
    this.accountForm.get('minimumPayment')?.clearValidators();
    this.accountForm.get('creditLimit')?.clearValidators();
    
    // Apply validators based on type and isDebt
    if (type === 'credit' || isDebt) {
      this.accountForm.get('interestRate')?.setValidators([Validators.min(0), Validators.max(100)]);
      this.accountForm.get('dueDate')?.setValidators([]);
      this.accountForm.get('minimumPayment')?.setValidators([Validators.min(0)]);
    }
    
    if (type === 'credit') {
      this.accountForm.get('creditLimit')?.setValidators([Validators.min(0)]);
    }
    
    // Update validators
    this.accountForm.get('interestRate')?.updateValueAndValidity();
    this.accountForm.get('dueDate')?.updateValueAndValidity();
    this.accountForm.get('minimumPayment')?.updateValueAndValidity();
    this.accountForm.get('creditLimit')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.accountForm.valid) {
      const newAccount = this.accountForm.value;
      
      this.accountService.addAccount(this.email, newAccount)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error adding account:', error);
          }
        });
    }
  }
}