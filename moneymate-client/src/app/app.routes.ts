import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { FinancesTrendsComponent } from './components/finances-trends/finances-trends.component';
import { BudgetComponent } from './components/budget/budget.component';
import { SavingsComponent } from './components/savings/savings.component';
import { AccountsComponent } from './components/accounts/accounts.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
    {path: 'trends', component: FinancesTrendsComponent, canActivate: [AuthGuard]},
    {path: 'budget', component: BudgetComponent, canActivate: [AuthGuard]},
    {path: 'savings', component: SavingsComponent, canActivate: [AuthGuard]},
    {path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard]},
];