import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-3">
      <h2 class="fw-bold text-white mb-4">Instructor Dashboard</h2>

      <!-- Metrics Row -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">My Courses</h6>
            <h2 class="display-5 fw-bold text-primary mb-0">{{ stats()?.myCoursesCount || 0 }}</h2>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">Total Students</h6>
            <h2 class="display-5 fw-bold text-success mb-0">{{ stats()?.myStudentsCount || 0 }}</h2>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">Total Earnings</h6>
            <h2 class="display-5 fw-bold text-gradient mb-0">₹{{ stats()?.myEarnings || 0 }}</h2>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card bg-dark border-secondary p-4 rounded-3 shadow">
        <h4 class="text-white fw-bold mb-3">Quick Actions</h4>
        <div class="d-flex flex-wrap gap-3">
          <a routerLink="/instructor/create-course" class="btn btn-primary px-4 py-2">Create New Course</a>
          <a routerLink="/instructor/my-courses" class="btn btn-outline-light px-4 py-2">Manage Courses</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-dark-card {
      background-color: #1a1e23;
    }
    .text-gradient {
      background: linear-gradient(135deg, #20c997, #0dcaf0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class InstructorDashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe(res => this.stats.set(res));
  }
}
