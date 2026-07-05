import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnrollmentService, Enrollment, LessonProgress } from '../../core/services/enrollment.service';
import { CourseService, Lesson } from '../../core/services/course.service';

@Component({
  selector: 'app-course-watch',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid my-3 flex-grow-1" *ngIf="enrollment()">
      <!-- Certificate unlocked alert banner -->
      @if (enrollment()?.completed) {
        <div class="alert alert-success d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 border-success shadow" role="alert">
          <div>
            <h5 class="alert-heading fw-bold mb-1">🎉 Congratulations! You completed the course!</h5>
            <p class="mb-0 small text-dark">Your certificate of completion has been issued and verified.</p>
          </div>
          <button (click)="viewCertificate()" class="btn btn-success fw-bold px-4">Download Certificate</button>
        </div>
      }

      <div class="row g-4">
        <!-- Video Player & Details (Left) -->
        <div class="col-lg-8">
          <div class="card bg-dark border-secondary overflow-hidden mb-4 shadow">
            @if (currentLesson()) {
              <div class="ratio ratio-16x9 bg-black">
                <video #videoPlayer controls class="w-100 h-100" [src]="currentLesson()?.videoUrl" (ended)="onVideoEnded()"></video>
              </div>
              <div class="card-body p-4">
                <h3 class="text-white fw-bold mb-2">{{ currentLesson()?.title }}</h3>
                <p class="text-muted small mb-4">Lesson Content</p>
                <div class="text-light-muted" [innerHTML]="currentLesson()?.content || 'No text content provided for this lesson.'"></div>
              </div>
            } @else {
              <div class="ratio ratio-16x9 bg-black d-flex align-items-center justify-content-center flex-column text-muted">
                <span class="fs-4">Select a lesson from the syllabus to start watching</span>
              </div>
            }
          </div>
        </div>

        <!-- Syllabus & Lesson Lists (Right Sidebar) -->
        <div class="col-lg-4">
          <div class="card bg-dark-card border-secondary shadow-sm" style="border-radius: 10px;">
            <div class="card-header bg-dark border-secondary p-3">
              <h5 class="text-white fw-bold mb-1">{{ enrollment()?.course?.title }}</h5>
              <div class="d-flex justify-content-between mb-1 small text-muted">
                <span>Overall Progress</span>
                <span>{{ enrollment()?.progress }}%</span>
              </div>
              <div class="progress bg-black border border-secondary" style="height: 8px;">
                <div class="progress-bar bg-success" role="progressbar" [style.width.%]="enrollment()?.progress"></div>
              </div>
            </div>
            
            <div class="list-group list-group-flush overflow-auto" style="max-height: 500px;">
              @for (sec of enrollment()?.course?.sections; track sec.id) {
                <div class="p-3 bg-dark border-bottom border-secondary text-white fw-bold small">
                  {{ sec.title }}
                </div>
                @for (les of sec.lessons; track les.id) {
                  <div class="list-group-item bg-dark-card border-secondary text-light d-flex align-items-center gap-2 py-3 px-3 hover-bg"
                       [class.bg-active-lesson]="currentLesson()?.id === les.id" style="cursor: pointer;" (click)="selectLesson(les)">
                    <!-- Checkbox to track completion -->
                    <input type="checkbox" class="form-check-input" [checked]="isLessonCompleted(les.id)"
                           (click)="$event.stopPropagation()" (change)="toggleCompletion(les.id, $event)">
                    
                    <div class="flex-grow-1 min-w-0 ms-1">
                      <span class="small d-block text-truncate fw-bold text-white">{{ les.title }}</span>
                      @if (les.videoDuration) {
                        <span class="small text-muted" style="font-size: 0.75rem;">{{ Math.round(les.videoDuration / 60) }} mins</span>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-dark-card {
      background-color: #161a1f;
    }
    .hover-bg:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }
    .bg-active-lesson {
      background-color: rgba(13, 110, 253, 0.12) !important;
      border-left: 3px solid #0d6efd;
    }
    .text-light-muted {
      color: #8c98a5;
    }
  `]
})
export class CourseWatchComponent implements OnInit {
  enrollment = signal<Enrollment | null>(null);
  currentLesson = signal<Lesson | null>(null);
  Math = Math;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private enrollmentService = inject(EnrollmentService);

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    if (!courseId) {
      this.router.navigate(['/student/my-courses']);
      return;
    }

    this.loadEnrollment(courseId);
  }

  loadEnrollment(courseId: number): void {
    this.enrollmentService.getEnrollmentDetails(courseId).subscribe({
      next: (res) => {
        this.enrollment.set(res);
        // Set first lesson as active default if none is selected
        if (!this.currentLesson() && res.course.sections && res.course.sections.length > 0) {
          const firstSection = res.course.sections[0];
          if (firstSection.lessons && firstSection.lessons.length > 0) {
            this.selectLesson(firstSection.lessons[0]);
          }
        }
      },
      error: () => this.router.navigate(['/student/my-courses'])
    });
  }

  selectLesson(lesson: Lesson): void {
    this.currentLesson.set(lesson);
    // Reload player
    setTimeout(() => {
      if (this.videoPlayer && this.videoPlayer.nativeElement) {
        this.videoPlayer.nativeElement.load();
        this.videoPlayer.nativeElement.play().catch(() => {}); // catch browser autoplay block
      }
    }, 50);
  }

  isLessonCompleted(lessonId?: number): boolean {
    if (!lessonId) return false;
    const progressList = this.enrollment()?.lessonProgressList;
    if (!progressList) return false;
    const progress = progressList.find(p => p.lesson.id === lessonId);
    return progress ? progress.completed : false;
  }

  toggleCompletion(lessonId?: number, event?: any): void {
    if (!lessonId) return;
    const courseId = this.enrollment()?.course?.id;
    if (!courseId) return;

    const completed = event.target.checked;

    this.enrollmentService.updateLessonProgress(courseId, lessonId, completed).subscribe({
      next: (updatedEnrollment) => {
        this.enrollment.set(updatedEnrollment);
      }
    });
  }

  onVideoEnded(): void {
    const active = this.currentLesson();
    if (!active || !active.id) return;
    
    // Auto-mark completed when video ends!
    if (!this.isLessonCompleted(active.id)) {
      this.toggleVideoEndedCompletion(active.id);
    }
  }

  toggleVideoEndedCompletion(lessonId: number): void {
    const courseId = this.enrollment()?.course?.id;
    if (!courseId) return;

    this.enrollmentService.updateLessonProgress(courseId, lessonId, true).subscribe({
      next: (updatedEnrollment) => {
        this.enrollment.set(updatedEnrollment);
      }
    });
  }

  viewCertificate(): void {
    const courseId = this.enrollment()?.course?.id;
    this.enrollmentService.getMyCertificates().subscribe(certs => {
      const match = certs.find(c => c.course.id === courseId);
      if (match) {
        window.open(`/certificates/verify/${match.certificateUuid}`, '_blank');
      }
    });
  }
}
