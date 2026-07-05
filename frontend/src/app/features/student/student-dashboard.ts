import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { EnrollmentService, Enrollment, Certificate } from '../../core/services/enrollment.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-3">
      <h2 class="fw-bold text-white mb-4">Student Dashboard</h2>

      <!-- Metrics Row -->
      <div class="row g-4 mb-5">
        <div class="col-md-6">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">My Enrollments</h6>
            <h2 class="display-5 fw-bold text-primary mb-0">{{ stats()?.myEnrollmentsCount || 0 }}</h2>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-dark-card border-secondary p-4 shadow-sm text-center">
            <h6 class="text-muted text-uppercase small">Completed Courses</h6>
            <h2 class="display-5 fw-bold text-success mb-0">{{ stats()?.completedCoursesCount || 0 }}</h2>
          </div>
        </div>
      </div>

      <!-- Active Courses -->
      <div class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="text-white fw-bold mb-0">Active Courses</h4>
          <a routerLink="/student/my-courses" class="text-primary text-decoration-none small">View All &rarr;</a>
        </div>

        @if (enrollments().length === 0) {
          <div class="card bg-dark-card border-secondary p-5 text-center">
            <p class="text-muted mb-3">You are not enrolled in any courses yet.</p>
            <a routerLink="/courses" class="btn btn-primary btn-sm px-3 py-2 align-self-center">Browse Catalog</a>
          </div>
        } @else {
          <div class="row g-4">
            @for (enr of enrollments().slice(0, 2); track enr.id) {
              <div class="col-md-6">
                <div class="card bg-dark-card border-secondary p-3 shadow-sm h-100 d-flex flex-row align-items-center gap-3">
                  <img [src]="enr.course.imageUrl || 'assets/course-placeholder.jpg'" alt="Course Thumbnail" 
                       style="width: 120px; height: 80px; object-fit: cover; border-radius: 6px;">
                  <div class="flex-grow-1 min-w-0">
                    <h5 class="text-white fw-bold text-truncate mb-1">{{ enr.course.title }}</h5>
                    <div class="progress bg-dark border border-secondary mb-2" style="height: 8px;">
                      <div class="progress-bar bg-primary" role="progressbar" [style.width.%]="enr.progress"></div>
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                      <span class="small text-muted">{{ enr.progress }}% Complete</span>
                      <a [routerLink]="['/student/course', enr.course.id]" class="btn btn-outline-primary btn-sm py-1">Resume</a>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- My Certificates -->
      <div>
        <h4 class="text-white fw-bold mb-3">My Certificates</h4>
        @if (certificates().length === 0) {
          <div class="card bg-dark-card border-secondary p-4 text-center">
            <p class="text-muted mb-0 small">Certificates will appear here once you complete a course 100%.</p>
          </div>
        } @else {
          <div class="list-group border-secondary">
            @for (cert of certificates(); track cert.id) {
              <div class="list-group-item bg-dark-card border-secondary text-white d-flex justify-content-between align-items-center py-3">
                <div>
                  <h6 class="mb-0 fw-bold">{{ cert.course.title }}</h6>
                  <span class="small text-muted">Issued on: {{ cert.issuedAt | date:'mediumDate' }}</span>
                </div>
                <a [routerLink]="['/certificates/verify', cert.certificateUuid]" target="_blank" class="btn btn-outline-success btn-sm">View Certificate</a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bg-dark-card {
      background-color: #1a1e23;
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  enrollments = signal<Enrollment[]>([]);
  certificates = signal<Certificate[]>([]);

  private dashboardService = inject(DashboardService);
  private enrollmentService = inject(EnrollmentService);

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe(res => this.stats.set(res));
    this.enrollmentService.getMyCourses().subscribe(res => this.enrollments.set(res));
    this.enrollmentService.getMyCertificates().subscribe(res => this.certificates.set(res));
  }
}
