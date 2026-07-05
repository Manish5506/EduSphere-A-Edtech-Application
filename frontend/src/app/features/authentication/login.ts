import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/authentication/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container d-flex flex-grow-1 align-items-center justify-content-center my-5">
      <div class="card bg-dark border-secondary p-4 shadow-lg" style="width: 420px; border-radius: 12px;">
        <div class="text-center mb-4">
          <h2 class="fw-bold text-gradient">Welcome Back</h2>
          <p class="text-muted small">Sign in to continue your learning journey</p>
        </div>

        @if (errorMsg) {
          <div class="alert alert-danger py-2 small" role="alert">
            {{ errorMsg }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="mb-3">
            <label for="email" class="form-label small text-muted">Email Address</label>
            <input type="email" class="form-control bg-dark text-white border-secondary" id="email" 
                   [(ngModel)]="credentials.email" name="email" required #emailInput="ngModel"
                   placeholder="name@example.com">
          </div>

          <div class="mb-4">
            <label for="password" class="form-label small text-muted">Password</label>
            <input type="password" class="form-control bg-dark text-white border-secondary" id="password" 
                   [(ngModel)]="credentials.password" name="password" required
                   placeholder="Enter your password">
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 mb-3" [disabled]="!loginForm.valid || isLoading">
            @if (isLoading) {
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="text-center mt-2 small">
          <span class="text-muted">Don't have an account? </span>
          <a routerLink="/register" class="text-primary text-decoration-none">Sign Up</a>
        </div>

        <div class="mt-4 border-top border-secondary pt-3">
          <p class="text-muted small text-center mb-2">Or quick login for testing:</p>
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-outline-info btn-sm px-3" (click)="autofill('student')">Student</button>
            <button class="btn btn-outline-warning btn-sm px-3" (click)="autofill('instructor')">Instructor</button>
            <button class="btn btn-outline-danger btn-sm px-3" (click)="autofill('admin')">Admin</button>
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
export class LoginComponent {
  credentials = { email: '', password: '' };
  isLoading = false;
  errorMsg = '';
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  autofill(role: string): void {
    this.credentials.password = 'password123';
    if (role === 'student') {
      this.credentials.email = 'student@edtech.com';
    } else if (role === 'instructor') {
      this.credentials.email = 'instructor@edtech.com';
    } else if (role === 'admin') {
      this.credentials.email = 'admin@edtech.com';
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getRedirectUrl();
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Invalid email or password. Please try again.';
      }
    });
  }

  private getRedirectUrl(): string {
    if (this.authService.hasRole('admin')) return '/admin';
    if (this.authService.hasRole('instructor')) return '/instructor';
    return '/student';
  }
}
