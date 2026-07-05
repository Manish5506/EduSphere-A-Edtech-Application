import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/authentication/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container d-flex flex-grow-1 align-items-center justify-content-center my-5">
      <div class="card bg-dark border-secondary p-4 shadow-lg" style="width: 460px; border-radius: 12px;">
        <div class="text-center mb-4">
          <h2 class="fw-bold text-gradient">Create Account</h2>
          <p class="text-muted small">Join EduSphere today and start learning or teaching</p>
        </div>

        @if (errorMsg) {
          <div class="alert alert-danger py-2 small" role="alert">
            {{ errorMsg }}
          </div>
        }
        @if (successMsg) {
          <div class="alert alert-success py-2 small" role="alert">
            {{ successMsg }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label small text-muted">First Name</label>
              <input type="text" class="form-control bg-dark text-white border-secondary" id="firstName" 
                     [(ngModel)]="user.firstName" name="firstName" required placeholder="John">
            </div>
            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label small text-muted">Last Name</label>
              <input type="text" class="form-control bg-dark text-white border-secondary" id="lastName" 
                     [(ngModel)]="user.lastName" name="lastName" required placeholder="Doe">
            </div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label small text-muted">Email Address</label>
            <input type="email" class="form-control bg-dark text-white border-secondary" id="email" 
                   [(ngModel)]="user.email" name="email" required placeholder="john.doe@example.com">
          </div>

          <div class="mb-3">
            <label for="password" class="form-label small text-muted">Password (min 6 chars)</label>
            <input type="password" class="form-control bg-dark text-white border-secondary" id="password" 
                   [(ngModel)]="user.password" name="password" required minlength="6" placeholder="Choose a password">
          </div>

          <div class="mb-4">
            <label class="form-label small text-muted d-block">Register As</label>
            <div class="btn-group w-100" role="group">
              <input type="radio" class="btn-check" name="role" id="roleStudent" value="student" [(ngModel)]="user.role" checked>
              <label class="btn btn-outline-primary" for="roleStudent">Student</label>

              <input type="radio" class="btn-check" name="role" id="roleInstructor" value="instructor" [(ngModel)]="user.role">
              <label class="btn btn-outline-primary" for="roleInstructor">Instructor</label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 mb-3" [disabled]="!registerForm.valid || isLoading">
            @if (isLoading) {
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creating Account...
            } @else {
              Sign Up
            }
          </button>
        </form>

        <div class="text-center mt-2 small">
          <span class="text-muted">Already have an account? </span>
          <a routerLink="/login" class="text-primary text-decoration-none">Sign In</a>
        </div>

        <div class="mt-4 border-top border-secondary pt-3">
          <p class="text-muted small text-center mb-2">Or autofill new account details for testing:</p>
          <div class="text-center">
            <button class="btn btn-outline-info btn-sm px-4" (click)="autofill()">Autofill Demo Details</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-gradient {
      background: linear-gradient(135deg, #0d6efd, #0dcaf0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class RegisterComponent {
  user = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student'
  };
  isLoading = false;
  errorMsg = '';
  successMsg = '';
  private authService = inject(AuthService);
  private router = inject(Router);

  autofill(): void {
    const randomSuffix = Math.floor(Math.random() * 1000);
    this.user.firstName = 'Demo';
    this.user.lastName = 'User' + randomSuffix;
    this.user.email = `demo${randomSuffix}@edtech.com`;
    this.user.password = 'password123';
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.authService.register(this.user).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMsg = 'Account created successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Registration failed. Please check the form and try again.';
      }
    });
  }
}
