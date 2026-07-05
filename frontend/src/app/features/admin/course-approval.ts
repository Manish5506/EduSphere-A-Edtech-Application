import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../core/services/course.service';

@Component({
  selector: 'app-course-approval',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-3">
      <h2 class="fw-bold text-white mb-4">Course Approval Panel</h2>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (courses().length === 0) {
        <div class="card bg-dark-card border-secondary p-5 text-center my-4">
          <p class="text-muted mb-0 small">No courses pending approval at this time.</p>
        </div>
      } @else {
        <div class="table-responsive border border-secondary rounded">
          <table class="table table-dark table-striped table-hover mb-0 align-middle">
            <thead>
              <tr class="text-muted small">
                <th scope="col" class="ps-3">Title</th>
                <th scope="col">Category</th>
                <th scope="col">Instructor</th>
                <th scope="col">Price</th>
                <th scope="col" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of courses(); track c.id) {
                <tr>
                  <td class="ps-3 fw-bold">{{ c.title }}</td>
                  <td>{{ c.categoryName }}</td>
                  <td>{{ c.instructorName }}</td>
                  <td>₹{{ c.price }}</td>
                  <td class="text-end pe-3">
                    <a [routerLink]="['/courses', c.id]" target="_blank" class="btn btn-outline-info btn-sm me-2">Preview Profile</a>
                    <button (click)="approveCourse(c.id)" class="btn btn-success btn-sm">Approve & Publish</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .bg-dark-card {
      background-color: #1a1e23;
    }
  `]
})
export class CourseApprovalComponent implements OnInit {
  courses = signal<Course[]>([]);
  isLoading = signal<boolean>(false);

  private courseService = inject(CourseService);

  ngOnInit(): void {
    this.loadPendingCourses();
  }

  loadPendingCourses(): void {
    this.isLoading.set(true);
    this.courseService.getPendingCourses().subscribe({
      next: (res) => {
        this.courses.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  approveCourse(id?: number): void {
    if (!id) return;
    this.courseService.approveCourse(id, true).subscribe(() => this.loadPendingCourses());
  }
}
