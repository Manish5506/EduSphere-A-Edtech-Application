import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../core/services/course.service';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="my-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold text-white mb-0">My Created Courses</h2>
        <a routerLink="/instructor/create-course" class="btn btn-primary btn-sm px-3">Create Course</a>
      </div>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (courses().length === 0) {
        <div class="card bg-dark-card border-secondary p-5 text-center my-4">
          <h4 class="text-white mb-3">No Courses Created Yet</h4>
          <p class="text-muted mb-4">You haven't designed any curriculum on EduSphere yet. Let's begin!</p>
          <a routerLink="/instructor/create-course" class="btn btn-primary px-4 py-2 align-self-center">Create First Course</a>
        </div>
      } @else {
        <div class="table-responsive border border-secondary rounded">
          <table class="table table-dark table-striped table-hover mb-0 align-middle">
            <thead>
              <tr class="text-muted small">
                <th scope="col" class="ps-3">Course Title</th>
                <th scope="col">Price</th>
                <th scope="col">Status</th>
                <th scope="col">Publishing</th>
                <th scope="col" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of courses(); track c.id) {
                <tr>
                  <td class="ps-3 fw-bold">{{ c.title }}</td>
                  <td>₹{{ c.price }}</td>
                  <td>
                    @if (c.approved) {
                      <span class="badge bg-success">Approved</span>
                    } @else {
                      <span class="badge bg-warning text-dark">Pending Admin Approval</span>
                    }
                  </td>
                  <td>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" [checked]="c.published" 
                             (change)="togglePublish(c, $event)" [id]="'publishSwitch' + c.id">
                      <label class="form-check-label small text-muted" [for]="'publishSwitch' + c.id">
                        {{ c.published ? 'Published' : 'Draft' }}
                      </label>
                    </div>
                  </td>
                  <td class="text-end pe-3">
                    <a [routerLink]="['/instructor/create-course', c.id]" class="btn btn-outline-info btn-sm me-2">Manage Syllabus</a>
                    <button (click)="deleteCourse(c.id)" class="btn btn-danger btn-sm">Delete</button>
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
export class InstructorCoursesComponent implements OnInit {
  courses = signal<Course[]>([]);
  isLoading = signal<boolean>(false);

  private courseService = inject(CourseService);

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.courseService.getMyCourses().subscribe({
      next: (res) => {
        this.courses.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  togglePublish(course: Course, event: any): void {
    if (!course.id) return;
    const published = event.target.checked;
    this.courseService.publishCourse(course.id, published).subscribe();
  }

  deleteCourse(id?: number): void {
    if (!id || !confirm('Are you sure you want to delete this course? This action is irreversible.')) return;
    this.courseService.deleteCourse(id).subscribe(() => this.loadCourses());
  }
}
