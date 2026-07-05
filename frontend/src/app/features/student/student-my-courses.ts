import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnrollmentService, Enrollment } from '../../core/services/enrollment.service';

@Component({
  selector: 'app-student-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-3">
      <h2 class="fw-bold text-white mb-4">My Learnings</h2>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (enrollments().length === 0) {
        <div class="card bg-dark-card border-secondary p-5 text-center my-4">
          <h4 class="text-white mb-3">No Enrolled Courses</h4>
          <p class="text-muted mb-4">Browse our course catalog to find a course and start learning.</p>
          <a routerLink="/courses" class="btn btn-primary px-4 py-2 align-self-center">Explore Courses</a>
        </div>
      } @else {
        <div class="row g-4">
          @for (enr of enrollments(); track enr.id) {
            <div class="col-md-4 col-sm-6">
              <div class="card h-100 bg-dark-card border-secondary overflow-hidden shadow hover-scale">
                <img [src]="enr.course.imageUrl || 'assets/course-placeholder.jpg'" class="card-img-top" alt="Course Image" style="height: 160px; object-fit: cover;">
                <div class="card-body p-3 d-flex flex-column">
                  <h5 class="card-title fw-bold text-white mb-2 text-truncate">{{ enr.course.title }}</h5>
                  <p class="text-muted small mb-3 text-truncate">By {{ enr.course.instructorName }}</p>
                  
                  <div class="mt-auto pt-2 border-top border-secondary">
                    <div class="d-flex justify-content-between mb-1 small text-muted">
                      <span>Progress</span>
                      <span>{{ enr.progress }}%</span>
                    </div>
                    <div class="progress bg-dark border border-secondary mb-3" style="height: 6px;">
                      <div class="progress-bar bg-primary" role="progressbar" [style.width.%]="enr.progress"></div>
                    </div>
                    <a [routerLink]="['/student/course', enr.course.id]" class="btn btn-primary w-100 btn-sm py-2">
                      {{ enr.progress === 100 ? 'Review Course' : 'Continue Learning' }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .bg-dark-card {
      background-color: #1a1e23;
    }
    .hover-scale {
      transition: transform 0.2s ease-in-out;
    }
    .hover-scale:hover {
      transform: translateY(-3px);
    }
  `]
})
export class StudentMyCoursesComponent implements OnInit {
  enrollments = signal<Enrollment[]>([]);
  isLoading = signal<boolean>(false);

  private enrollmentService = inject(EnrollmentService);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.enrollmentService.getMyCourses().subscribe({
      next: (res) => {
        this.enrollments.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
