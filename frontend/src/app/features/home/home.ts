import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../core/services/course.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="hero-section text-center py-5 d-flex align-items-center justify-content-center flex-column border-bottom border-secondary">
      <div class="container py-5">
        <h1 class="display-3 fw-extrabold text-white mb-3">
          Elevate Your Skills With <span class="text-gradient">EduSphere</span>
        </h1>
        <p class="lead text-muted max-w-600 mx-auto mb-5">
          Access high-quality courses taught by industry professionals. Learn at your own pace with interactive video lessons, progress tracking, and verified certificates.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/courses" class="btn btn-primary btn-lg px-4 py-3 shadow-lg hover-glow">Explore Courses</a>
          <a routerLink="/register" class="btn btn-outline-light btn-lg px-4 py-3">Become an Instructor</a>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-5 container my-4">
      <h2 class="text-center fw-bold mb-5 text-white">Why Learn on <span class="text-gradient">EduSphere</span>?</h2>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card h-100 bg-dark-card border-secondary p-4 rounded-3 shadow">
            <div class="icon-container mb-3 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-laptop" viewBox="0 0 16 16">
                <path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5"/>
              </svg>
            </div>
            <h4 class="text-white fw-bold">Flexible Learning</h4>
            <p class="text-muted small mb-0">Watch high-definition lectures anytime, anywhere on any device. Start, pause, and resume right where you left off.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 bg-dark-card border-secondary p-4 rounded-3 shadow">
            <div class="icon-container mb-3 text-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-wallet2" viewBox="0 0 16 16">
                <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9A1.5 1.5 0 0 1 1.5 3H2V1.78a1.5 1.5 0 0 1 1.864-1.454zM3 3h8V1.78a.5.5 0 0 0-.62-.485L3.102 2.019A.5.5 0 0 0 3 2.5zm11.5 1H1.5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5"/>
              </svg>
            </div>
            <h4 class="text-white fw-bold">Secure Transactions</h4>
            <p class="text-muted small mb-0">Integrated with Razorpay to provide secure, instantaneous checkout. Buy courses individually or load them to your cart.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 bg-dark-card border-secondary p-4 rounded-3 shadow">
            <div class="icon-container mb-3 text-gradient">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                <path d="m10.273 2.513-.921-.944.525-1.3A1.72 1.72 0 0 0 8.25 0h-1.5A1.72 1.72 0 0 0 5.123.269l.525 1.3-.921.944a1.72 1.72 0 0 0-.44 1.43l.255 1.47a1.72 1.72 0 0 0 .993 1.34l1.294.635-.615 1.332a1.72 1.72 0 0 0 .093 1.666l.82 1.314a1.72 1.72 0 0 0 1.58.743h1.5a1.72 1.72 0 0 0 1.58-.743l.82-1.314a1.72 1.72 0 0 0 .093-1.666l-.615-1.332 1.294-.635a1.72 1.72 0 0 0 .993-1.34l.255-1.47a1.72 1.72 0 0 0-.44-1.43zm-.3 1.353a.5.5 0 0 1 .494.314l.442 1.29 1.365.158a.5.5 0 0 1 .293.833l-.99.967.233 1.362a.5.5 0 0 1-.726.528L9.5 8l-1.222.642a.5.5 0 0 1-.726-.528l.233-1.362-.99-.967a.5.5 0 0 1 .293-.833l1.365-.158.442-1.29a.5.5 0 0 1 .494-.314"/>
              </svg>
            </div>
            <h4 class="text-white fw-bold">Verified Certificates</h4>
            <p class="text-muted small mb-0">Complete all video lessons in a course to automatically unlock and download a unique verified PDF certificate of completion.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Courses Section -->
    <section class="py-5 container mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold text-white mb-0">Popular Courses</h2>
        <a routerLink="/courses" class="text-primary text-decoration-none small fw-bold">View All &rarr;</a>
      </div>

      @if (courses().length === 0) {
        <div class="text-center py-5 border border-secondary bg-dark-card rounded-3">
          <p class="text-muted mb-0">No courses published yet. Check back soon!</p>
        </div>
      } @else {
        <div class="row g-4">
          @for (course of courses().slice(0, 3); track course.id) {
            <div class="col-md-4">
              <div class="card h-100 bg-dark-card border-secondary overflow-hidden shadow hover-scale">
                <img [src]="course.imageUrl || 'assets/course-placeholder.jpg'" class="card-img-top" alt="Course Image" style="height: 180px; object-fit: cover;">
                <div class="card-body p-3 d-flex flex-column">
                  <span class="badge bg-secondary align-self-start mb-2">{{ course.categoryName }}</span>
                  <h5 class="card-title fw-bold text-white mb-1">{{ course.title }}</h5>
                  <p class="text-muted small text-truncate mb-3">{{ course.subtitle }}</p>
                  <div class="mt-auto d-flex align-items-center justify-content-between">
                    <span class="fs-5 fw-bold text-gradient">{{ course.price === 0 ? 'Free' : '₹' + course.price }}</span>
                    <a [routerLink]="['/courses', course.id]" class="btn btn-outline-primary btn-sm">View Details</a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .hero-section {
      background: radial-gradient(circle at 50% 50%, rgba(21, 25, 30, 1) 0%, rgba(10, 15, 20, 1) 100%);
      min-height: 480px;
    }
    .text-gradient {
      background: linear-gradient(135deg, #0d6efd, #0dcaf0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .bg-dark-card {
      background-color: #1a1e23;
    }
    .max-w-600 {
      max-width: 600px;
    }
    .hover-glow:hover {
      box-shadow: 0 0 15px rgba(13, 110, 253, 0.4);
      transition: all 0.2s ease-in-out;
    }
    .hover-scale {
      transition: transform 0.2s ease-in-out;
    }
    .hover-scale:hover {
      transform: translateY(-5px);
    }
  `]
})
export class HomeComponent implements OnInit {
  courses = signal<Course[]>([]);
  private courseService = inject(CourseService);

  ngOnInit(): void {
    this.courseService.getCourses().subscribe({
      next: (res) => this.courses.set(res),
      error: () => {} // Silence errors during loading
    });
  }
}
