import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-3">
      <h2 class="fw-bold text-white mb-4">Admin Dashboard</h2>

      <!-- Metrics Row -->
      <div class="row g-4 mb-5">
        <div class="col-md-3">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">Total Users</h6>
            <h2 class="display-6 fw-bold text-primary mb-0">{{ stats()?.totalUsers || 0 }}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">Total Courses</h6>
            <h2 class="display-6 fw-bold text-success mb-0">{{ stats()?.totalCourses || 0 }}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">Instructors</h6>
            <h2 class="display-6 fw-bold text-info mb-0">{{ stats()?.totalInstructors || 0 }}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">Total Revenue</h6>
            <h2 class="display-6 fw-bold text-gradient mb-0">₹{{ stats()?.totalRevenue || 0 }}</h2>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card bg-dark border-secondary p-4 rounded-3 shadow mb-4">
        <h4 class="text-white fw-bold mb-3">Administrative Panels</h4>
        <div class="d-flex flex-wrap gap-3">
          <a routerLink="/admin/course-approval" class="btn btn-primary px-4 py-2">Approve Courses</a>
          <a routerLink="/admin/categories" class="btn btn-outline-light px-4 py-2">Manage Categories</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-dark-card {
      background-color: #1a1e23;
    }
    .text-gradient {
      background: linear-gradient(135deg, #ffc107, #ff5722);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe(res => this.stats.set(res));
  }
}
