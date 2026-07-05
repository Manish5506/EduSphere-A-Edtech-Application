import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/authentication/auth.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  authService = inject(AuthService);
  paymentService = inject(PaymentService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getDashboardLink(): string {
    const user = this.authService.currentUser();
    if (!user) return '/';
    if (this.authService.hasRole('admin')) return '/admin';
    if (this.authService.hasRole('instructor')) return '/instructor';
    return '/student';
  }
}
