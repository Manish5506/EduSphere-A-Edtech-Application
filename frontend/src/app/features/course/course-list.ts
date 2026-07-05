import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course, Category } from '../../core/services/course.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container my-5 flex-grow-1">
      <div class="text-center mb-5">
        <h1 class="fw-bold text-white mb-2">Explore All Courses</h1>
        <p class="text-muted">Find the perfect course to upgrade your skills</p>
      </div>

      <!-- Search & Filters -->
      <div class="row g-3 mb-5 justify-content-center">
        <div class="col-md-5">
          <div class="input-group border border-secondary rounded overflow-hidden">
            <input type="text" class="form-control bg-dark text-white border-0" 
                   placeholder="Search courses..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
            <button class="btn btn-primary" type="button" (click)="onSearch()">
              Search
            </button>
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="selectedCategoryId" (change)="onCategoryChange()">
            <option [value]="0">All Categories</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Course Listing Grid -->
      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (courses().length === 0) {
        <div class="text-center py-5 border border-secondary bg-dark-card rounded-3 my-4">
          <h4>No Courses Found</h4>
          <p class="text-muted mb-0">Try searching for something else or check back later.</p>
        </div>
      } @else {
        <div class="row g-4">
          @for (course of courses(); track course.id) {
            <div class="col-md-4 col-sm-6">
              <div class="card h-100 bg-dark-card border-secondary overflow-hidden shadow hover-scale">
                <img [src]="course.imageUrl || 'assets/course-placeholder.jpg'" class="card-img-top" alt="Course Image" style="height: 180px; object-fit: cover;">
                <div class="card-body p-3 d-flex flex-column">
                  <span class="badge bg-secondary align-self-start mb-2">{{ course.categoryName }}</span>
                  <h5 class="card-title fw-bold text-white mb-1">{{ course.title }}</h5>
                  <p class="text-muted small text-truncate mb-3">{{ course.subtitle }}</p>
                  <div class="mt-auto d-flex align-items-center justify-content-between border-top border-secondary pt-3">
                    <span class="fs-5 fw-bold text-gradient">{{ course.price === 0 ? 'Free' : '₹' + course.price }}</span>
                    <a [routerLink]="['/courses', course.id]" class="btn btn-outline-primary btn-sm">View Course</a>
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
    .text-gradient {
      background: linear-gradient(135deg, #0d6efd, #0dcaf0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hover-scale {
      transition: transform 0.2s ease-in-out;
    }
    .hover-scale:hover {
      transform: translateY(-5px);
    }
  `]
})
export class CourseListComponent implements OnInit {
  courses = signal<Course[]>([]);
  categories = signal<Category[]>([]);
  searchQuery = '';
  selectedCategoryId = 0;
  isLoading = signal<boolean>(false);

  private courseService = inject(CourseService);

  ngOnInit(): void {
    this.loadCategories();
    this.loadCourses();
  }

  loadCategories(): void {
    this.courseService.getCategories().subscribe(res => this.categories.set(res));
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.courseService.getCourses().subscribe({
      next: (res) => {
        this.courses.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.loadCourses();
      return;
    }
    this.isLoading.set(true);
    this.courseService.searchCourses(this.searchQuery).subscribe({
      next: (res) => {
        this.courses.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onCategoryChange(): void {
    if (Number(this.selectedCategoryId) === 0) {
      this.loadCourses();
      return;
    }
    this.isLoading.set(true);
    this.courseService.getCoursesByCategory(this.selectedCategoryId).subscribe({
      next: (res) => {
        this.courses.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
