import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewEntryDialogComponent } from '../new-entry-dialog/new-entry-dialog.component';
import { Transaction } from '../../models/transaction.model';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { EditEntryDialogComponent } from '../edit-entry-dialog/edit-entry-dialog.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { TransactionService } from '../../services/transaction.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    MatIcon, MatPaginator, MatSort, MatProgressSpinner,
    MatCard, MatCardContent, MatTableModule, CommonModule,
    MatButton, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatInputModule, MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['category', 'amount', 'date', 'description', 'actions'];

  dataSource!: MatTableDataSource<Transaction>;
  loading = false;
  errorMessage = '';

  private originalData: Transaction[] = [];

  filterForm = new FormGroup({
    category: new FormControl(''),
    amount: new FormControl(''),
    dateRange: new FormControl('')
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categories = [
    'Groceries', 'Utilities', 'Entertainment',
    'Dining', 'Transportation', 'Other'
  ];

  dateRangeOptions = [
    { value: 'last_day', label: 'Last 24 Hours' },
    { value: 'last_week', label: 'Last 7 Days' },
    { value: 'last_month', label: 'Last 30 Days' }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    this.loading = true;
  
    this.transactionService.getTransactions(localStorage.getItem('email') || '')
      .subscribe({
        next: (transactions) => {
          // Convert transaction dates to Date objects
          this.originalData = transactions.map(transaction => ({
            ...transaction,
            date: new Date(transaction.date)
          }));
          
          this.dataSource = new MatTableDataSource(this.originalData);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load transactions. Please try again later.';
          this.loading = false;
          console.error(error);
        }
      });
  
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  

  applyFilters() {
    let filteredData = [...this.originalData];
  
    const selectedCategory = this.filterForm.get('category')?.value;
    if (selectedCategory) {
      filteredData = filteredData.filter(transaction =>
        transaction.category === selectedCategory
      );
    }

    const enteredAmount = this.filterForm.get('amount')?.value;
    if (enteredAmount) {
      filteredData = filteredData.filter(transaction =>
        transaction.amount <= Number(enteredAmount)
      );
    }
  
    const selectedDateRange = this.filterForm.get('dateRange')?.value;
    if (selectedDateRange) {
      const now = new Date();
      filteredData = filteredData.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        switch (selectedDateRange) {
          case 'last_day':
            return this.isWithinLastDay(transactionDate, now);
          case 'last_week':
            return this.isWithinLastWeek(transactionDate, now);
          case 'last_month':
            return this.isWithinLastMonth(transactionDate, now);
          default:
            return true;
        }
      });
    }
  
    this.dataSource.data = filteredData;
  }
  

  isWithinLastDay(transactionDate: Date, currentDate: Date): boolean {
    const oneDayAgo = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
    return transactionDate >= oneDayAgo && transactionDate <= currentDate;
  }
  
  isWithinLastWeek(transactionDate: Date, currentDate: Date): boolean {
    const oneWeekAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    return transactionDate >= oneWeekAgo && transactionDate <= currentDate;
  }
  
  isWithinLastMonth(transactionDate: Date, currentDate: Date): boolean {
    const oneMonthAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    return transactionDate >= oneMonthAgo && transactionDate <= currentDate;
  }
  

  addEntry() {
    const dialogRef = this.dialog.open(NewEntryDialogComponent, {
      width: '500px',
      data: { email: localStorage.getItem('email') || '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Entry added successfully', 'Close', {
          duration: 3000
        });
        this.originalData = [...this.originalData, result];
        this.applyFilters();
        window.location.reload();
      }
    });
  }

  editEntry(entry: any) {
    const dialogRef = this.dialog.open(EditEntryDialogComponent, {
      width: '500px',
      data: {
        email: localStorage.getItem('email') || '',
        entry: entry
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.originalData.findIndex(e => e._id === result._id);
        if (index !== -1) {
          const updatedData = [...this.originalData];
          updatedData[index] = result;
          this.originalData = updatedData;

          this.snackBar.open('Entry updated successfully', 'Close', {
            duration: 3000
          });

          this.applyFilters();
        }
      }
    });
  }

  deleteEntry(entryId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this entry?');
    if (confirmDelete) {
      this.transactionService.deleteTransaction(entryId, localStorage.getItem('email') || '')
        .subscribe({
          next: () => {
            this.originalData = this.originalData.filter(e => e._id !== entryId);

            this.snackBar.open('Entry deleted successfully', 'Close', {
              duration: 3000
            });

            this.applyFilters();
          },
          error: (error) => {
            this.snackBar.open('Failed to delete entry', 'Close', {
              duration: 3000
            });
            console.error(error);
          }
        });
    }
  }
}