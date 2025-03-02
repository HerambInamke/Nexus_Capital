import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

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
    CommonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    constructor(private router: Router) {}

    logout() {
      localStorage.removeItem('email');
      this.router.navigate(['/login']);
    }

    isOnLandingPage(): boolean {
      console.log(this.router.url);
      return this.router.url === '/';
    }

    isLoggedIn(): boolean {
      if(localStorage.getItem('email')){
        return true;
      };
      return false // Check if email exists in local storage
    }
}