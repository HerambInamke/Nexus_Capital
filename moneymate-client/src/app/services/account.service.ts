import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `https://moneymate-oy6p.onrender.com/api/account`;

  constructor(private http: HttpClient) {}

  getAccounts(email: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/get-accounts/${email}`).pipe(
      catchError(this.handleError)
    );
  }

  addAccount(email: string, account: Partial<Account>): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/add-account`, { 
      email, 
      ...account 
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateAccount(id: string, account: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/update-account/${id}`, account).pipe(
      catchError(this.handleError)
    );
  }

  deleteAccount(id: string, email: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-account/${id}`, {
      body: { email }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      console.error(error);
      errorMessage = `Error Status: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}