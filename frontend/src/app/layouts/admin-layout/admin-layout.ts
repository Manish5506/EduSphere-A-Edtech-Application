import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/authentication/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="d-flex min-vh-100 bg-dark text-light">
      <!-- Sidebar -->
      <aside class="sidebar border-end border-secondary bg-dark-sidebar p-3 d-flex flex-column" style="width: 260px;">
        <div class="brand mb-4 pb-2 border-bottom border-secondary">
          <a routerLink="/" class="fs-4 fw-bold text-gradient text-decoration-none">EduSphere</a>
          <div class="small text-muted mt-1">Admin Portal</div>
        </div>

        <ul class="nav flex-column gap-2 mb-auto">
          <li class="nav-item">
            <a routerLink="/admin" class="nav-link text-light p-2 rounded hover-bg-secondary" routerLinkActive="bg-primary text-white">
              Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/admin/course-approval" class="nav-link text-light p-2 rounded hover-bg-secondary" routerLinkActive="bg-primary text-white">
              Course Approvals
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/admin/categories" class="nav-link text-light p-2 rounded hover-bg-secondary" routerLinkActive="bg-primary text-white">
              Categories
            </a>
          </li>
        </ul>

        <div class="user-footer mt-auto pt-3 border-top border-secondary">
          <div class="small text-truncate fw-bold">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</div>
          <div class="small text-muted text-truncate mb-2">{{ authService.currentUser()?.email }}</div>
          <button (click)="logout()" class="btn btn-danger w-100 btn-sm">Logout</button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-grow-1 d-flex flex-column">
        <header class="bg-dark border-bottom border-secondary p-3 d-flex justify-content-end align-items-center">
          <a routerLink="/" class="btn btn-outline-light btn-sm me-2">Back to Website</a>
        </header>
        <main class="flex-grow-1 p-4 overflow-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .bg-dark-sidebar {
      background-color: #0c0f12;
    }
    .hover-bg-secondary:hover {
      background-color: rgba(255, 255, 255, 0.08);
      transition: background 0.2s ease-in-out;
    }
    .text-gradient {
      background: linear-gradient(135deg, #0d6efd, #0dcaf0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
