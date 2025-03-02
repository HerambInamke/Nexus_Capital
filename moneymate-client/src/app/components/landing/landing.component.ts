import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  isDarkMode = false;
  
  features = [
    {
      icon: 'account_balance_wallet',
      title: 'Expense Tracking',
      description: 'Log and categorize your daily expenses with ease. Get insights into your spending habits.'
    },
    {
      icon: 'savings',
      title: 'Savings Goals',
      description: 'Set and track your savings goals. Watch your progress and reach financial milestones.'
    },
    {
      icon: 'trending_up',
      title: 'Budget Management',
      description: 'Create custom budgets with spending alerts. Stay on top of your financial limits.'
    },
    {
      icon: 'account_balance',
      title: 'Account Management',
      description: 'Track all your accounts in one place. Monitor balances, debts, and net worth.'
    }
  ];

  testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'Nexus Capital has transformed how I manage both my personal and business finances. The intuitive interface makes tracking expenses effortless.',
      avatar: 'assets/avatar1.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      content: 'As someone who loves data, I appreciate how Nexus Capital visualizes my spending patterns. It\'s helped me save an extra 15% each month!',
      avatar: 'assets/avatar2.jpg'
    },
    {
      name: 'Aisha Patel',
      role: 'Financial Analyst',
      content: 'Even as a finance professional, I find Nexus Capital invaluable. The budgeting tools are sophisticated yet simple to use.',
      avatar: 'assets/avatar3.jpg'
    }
  ];

  constructor(private router: Router) {
    // Check if user has a theme preference stored
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  isLoggedIn(): boolean {
    if(localStorage.getItem('email')){
      return true;
    };
    return false;
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}