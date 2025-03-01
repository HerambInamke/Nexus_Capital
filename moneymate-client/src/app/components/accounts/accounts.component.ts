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
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { NewAccountDialogComponent } from '../new-account-dialog/new-account-dialog.component';
import { EditAccountDialogComponent } from '../edit-account-dialog/edit-account-dialog.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    MatIcon, MatPaginator, MatSort, MatProgressSpinner,
    MatCard, MatCardContent, MatTableModule, CommonModule,
    MatButton, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatInputModule, MatTooltipModule
  ],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'balance', 'isDebt', 'dueDate', 'actions'];
  dataSource!: MatTableDataSource<Account>;
  loading = false;
  errorMessage = '';
  totalBalance = 0;
  totalDebt = 0;
  netWorth = 0;

  filterForm = new FormGroup({
    type: new FormControl(''),
    isDebt: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  accountTypes = [
    { value: 'bank', label: 'Bank Account' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'digital', label: 'Digital Wallet' }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.loadAccounts();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadAccounts() {
    this.accountService.getAccounts(localStorage.getItem('email') || '')
      .subscribe({
        next: (accounts) => {
          this.dataSource = new MatTableDataSource(accounts);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.calculateTotals(accounts);
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load accounts. Please try again later.';
          this.loading = false;
          console.error(error);
        }
      });
  }

  calculateTotals(accounts: Account[]) {
    this.totalBalance = accounts
      .filter(account => !account.isDebt)
      .reduce((sum, account) => sum + account.balance, 0);
    
    this.totalDebt = accounts
      .filter(account => account.isDebt)
      .reduce((sum, account) => sum + account.balance, 0);
    
    this.netWorth = this.totalBalance - this.totalDebt;
  }

  applyFilters() {
    if (!this.dataSource) return;
    
    this.dataSource.filterPredicate = (data: Account, filter: string) => {
      const selectedType = this.filterForm.get('type')?.value;
      const selectedIsDebt = this.filterForm.get('isDebt')?.value;
      
      let matchesType = true;
      let matchesDebt = true;
      
      if (selectedType) {
        matchesType = data.type === selectedType;
      }
      
      if (selectedIsDebt !== null && selectedIsDebt !== '') {
        matchesDebt = data.isDebt === (selectedIsDebt === 'true');
      }
      
      return matchesType && matchesDebt;
    };
    
    this.dataSource.filter = Math.random().toString(); // Trigger filter
  }

  getAccountTypeLabel(type: string): string {
    const accountType = this.accountTypes.find(t => t.value === type);
    return accountType ? accountType.label : type;
  }

  getDaysUntilDue(dueDate: Date | undefined): number | null {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  addAccount() {
    const dialogRef = this.dialog.open(NewAccountDialogComponent, {
      width: '500px',
      data: { email: localStorage.getItem('email') || '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Account added successfully', 'Close', {
          duration: 3000
        });
        this.loadAccounts();
      }
    });
  }

  editAccount(account: Account) {
    const dialogRef = this.dialog.open(EditAccountDialogComponent, {
      width: '500px',
      data: {
        email: localStorage.getItem('email') || '',
        account: account
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Account updated successfully', 'Close', {
          duration: 3000
        });
        this.loadAccounts();
      }
    });
  }

  deleteAccount(accountId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this account?');
    if (confirmDelete) {
      this.accountService.deleteAccount(accountId, localStorage.getItem('email') || '')
        .subscribe({
          next: () => {
            this.snackBar.open('Account deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadAccounts();
          },
          error: (error) => {
            this.snackBar.open('Failed to delete account', 'Close', {
              duration: 3000
            });
            console.error(error);
          }
        });
    }
  }
}