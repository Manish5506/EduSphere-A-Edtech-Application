import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../core/services/course.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/authentication/auth.service';
import { EnrollmentService } from '../../core/services/enrollment.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container my-5 flex-grow-1" *ngIf="course()">
      <div class="row g-5">
        <!-- Main Details (Left Side) -->
        <div class="col-lg-8">
          <span class="badge bg-primary mb-3">{{ course()?.categoryName }}</span>
          <h1 class="display-4 fw-bold text-white mb-2">{{ course()?.title }}</h1>
          <p class="lead text-muted mb-4">{{ course()?.subtitle }}</p>

          <div class="card bg-dark border-secondary p-4 mb-4">
            <h4 class="text-white fw-bold mb-3">Course Description</h4>
            <div class="text-light-muted" [innerHTML]="course()?.description"></div>
          </div>

          <!-- Syllabus Accordion -->
          <h4 class="text-white fw-bold mt-5 mb-3">Course Syllabus</h4>
          <div class="accordion border-secondary bg-dark-card" id="syllabusAccordion">
            @for (sec of course()?.sections; track sec.id; let first = $first) {
              <div class="accordion-item bg-dark border-secondary text-white">
                <h2 class="accordion-header">
                  <button class="accordion-button bg-dark text-white border-bottom border-secondary" type="button" 
                          [class.collapsed]="!first" data-bs-toggle="collapse" [attr.data-bs-target]="'#collapse' + sec.id">
                    <span class="fw-bold">{{ sec.title }}</span>
                  </button>
                </h2>
                <div [id]="'collapse' + sec.id" class="accordion-collapse collapse" [class.show]="first" data-bs-parent="#syllabusAccordion">
                  <div class="accordion-body bg-dark-card p-0">
                    <ul class="list-group list-group-flush">
                      @for (les of sec.lessons; track les.id) {
                        <li class="list-group-item bg-dark-card border-secondary text-light d-flex justify-content-between align-items-center py-3">
                          <div class="d-flex align-items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-play-circle text-primary" viewBox="0 0 16 16">
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                              <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"/>
                            </svg>
                            <span>{{ les.title }}</span>
                          </div>
                          <div class="d-flex align-items-center gap-3">
                            @if (les.videoDuration) {
                              <span class="small text-muted">{{ Math.round(les.videoDuration / 60) }} mins</span>
                            }
                            @if (les.freePreview) {
                              <button (click)="openPreview(les.videoUrl)" class="btn btn-outline-info btn-xs py-0 px-2 small">Preview</button>
                            }
                          </div>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Sidebar Widget (Right Side) -->
        <div class="col-lg-4">
          <div class="card bg-dark-card border-secondary overflow-hidden shadow-lg position-sticky" style="top: 2rem; border-radius: 12px;">
            <img [src]="course()?.imageUrl || 'assets/course-placeholder.jpg'" class="card-img-top" alt="Course Banner" style="height: 200px; object-fit: cover;">
            <div class="card-body p-4 text-center">
              <span class="text-muted d-block small mb-1">Price</span>
              <h2 class="display-5 fw-bold text-white mb-4">₹{{ course()?.price }}</h2>

              @if (isEnrolled()) {
                <a [routerLink]="['/student/course', course()?.id]" class="btn btn-success w-100 py-3 mb-3 fw-bold">Go to Course Dashboard</a>
              } @else if (isInCart()) {
                <a routerLink="/cart" class="btn btn-outline-info w-100 py-3 mb-3 fw-bold">In Cart (Checkout)</a>
              } @else {
                <button (click)="addToCart()" class="btn btn-primary w-100 py-3 mb-3 fw-bold">Add to Cart</button>
              }

              <div class="small text-muted border-top border-secondary pt-3 mt-2">
                Created by <span class="text-white">{{ course()?.instructorName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Preview Modal (Bootstrap) -->
    <div class="modal fade" id="previewModal" tabindex="-1" aria-hidden="true" style="background-color: rgba(0, 0, 0, 0.85);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary">
          <div class="modal-header border-secondary text-white py-2">
            <h5 class="modal-title">Lesson Preview</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closePreview()"></button>
          </div>
          <div class="modal-body p-0 bg-black">
            <video #previewVideo controls width="100%" class="d-block" [src]="activePreviewUrl()"></video>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-dark-card {
      background-color: #1a1e23;
    }
    .text-light-muted {
      color: #8c98a5;
    }
  `]
})
export class CourseDetailsComponent implements OnInit {
  course = signal<Course | null>(null);
  isEnrolled = signal<boolean>(false);
  isInCart = signal<boolean>(false);
  activePreviewUrl = signal<string>('');
  Math = Math;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private enrollmentService = inject(EnrollmentService);

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (!courseId) {
      this.router.navigate(['/courses']);
      return;
    }

    this.courseService.getCourseById(courseId).subscribe({
      next: (res) => {
        this.course.set(res);
        this.checkCartStatus();
        this.checkEnrollmentStatus();
      },
      error: () => this.router.navigate(['/courses'])
    });
  }

  checkCartStatus(): void {
    const c = this.course();
    if (c && c.id) {
      this.isInCart.set(this.paymentService.isInCart(c.id));
    }
  }

  checkEnrollmentStatus(): void {
    const c = this.course();
    if (c && c.id && this.authService.isAuthenticated() && this.authService.hasRole('student')) {
      this.enrollmentService.getEnrollmentDetails(c.id).subscribe({
        next: () => this.isEnrolled.set(true),
        error: () => this.isEnrolled.set(false)
      });
    }
  }

  addToCart(): void {
    const c = this.course();
    if (!c) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/courses/${c.id}` } });
      return;
    }

    this.paymentService.addToCart(c);
    this.isInCart.set(true);
  }

  openPreview(videoUrl: string): void {
    this.activePreviewUrl.set(videoUrl);
    // Open Bootstrap Modal
    const modalElement = document.getElementById('previewModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closePreview(): void {
    const modalElement = document.getElementById('previewModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) videoElement.pause();
    this.activePreviewUrl.set('');
  }
}
