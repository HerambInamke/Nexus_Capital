import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule, 
    MatIcon, 
    RouterLink, 
    RouterLinkActive, 
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
    MatSlideToggleModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    isDarkMode = false;

    constructor(private router: Router) {}

    ngOnInit() {
      // Check if user has a theme preference stored
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
      }
    }

    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      
      // Apply theme to body
      if (this.isDarkMode) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }

    logout() {
      localStorage.removeItem('email');
      this.router.navigate(['/login']);
    }

    isOnLandingPage(): boolean {
      return this.router.url === '/';
    }

    isLoggedIn(): boolean {
      if(localStorage.getItem('email')){
        return true;
      };
      return false // Check if email exists in local storage
    }
}