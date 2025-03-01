import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatToolbarModule,  } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HotToastService } from '@ngneat/hot-toast';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatInputModule, MatIconModule, MatListModule, MatGridListModule, MatDialogModule, MatProgressSpinnerModule, RouterLink, MatToolbarModule, ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private toast: HotToastService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('register submitted', this.registerForm.value);

      this.authService.signup(this.registerForm.value.name, this.registerForm.value.email, this.registerForm.value.password).subscribe(
        (response) => {
          console.log(response);
          this.toast.success('Registration successful', { duration: 1500 });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        (error) => {
          console.error(error);
          this.toast.error('Registration failed');
        }
      );
    }
  }
}
