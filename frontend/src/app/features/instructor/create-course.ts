import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CourseService, Course, Category, Section, Lesson } from '../../core/services/course.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="my-3 container" style="max-width: 900px;">
      <h2 class="fw-bold text-white mb-4">{{ isEditMode() ? 'Manage Syllabus & Details' : 'Create New Course' }}</h2>

      <!-- Course Profile Section -->
      <div class="card bg-dark border-secondary p-4 mb-4 shadow">
        <h4 class="text-white fw-bold mb-3">Course Profile</h4>
        <form (ngSubmit)="saveCourseProfile()" #profileForm="ngForm">
          <div class="mb-3">
            <label class="form-label small text-muted">Course Title</label>
            <input type="text" class="form-control bg-dark text-white border-secondary" 
                   [(ngModel)]="courseForm.title" name="title" required placeholder="e.g. Master Angular 21 Standalone">
          </div>
          <div class="mb-3">
            <label class="form-label small text-muted">Subtitle / Short description</label>
            <input type="text" class="form-control bg-dark text-white border-secondary" 
                   [(ngModel)]="courseForm.subtitle" name="subtitle" required placeholder="e.g. Build enterprise single-page applications">
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label small text-muted">Price (INR)</label>
              <input type="number" class="form-control bg-dark text-white border-secondary" 
                     [(ngModel)]="courseForm.price" name="price" required placeholder="999">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label small text-muted">Category</label>
              <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="courseForm.categoryId" name="categoryId" required>
                <option [value]="0" disabled>Select Category</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small text-muted">Detailed Course Description (HTML/Text)</label>
            <textarea class="form-control bg-dark text-white border-secondary" rows="4"
                      [(ngModel)]="courseForm.description" name="description" placeholder="Provide a detailed syllabus overview..."></textarea>
          </div>

          <div class="row">
            <!-- Image upload -->
            <div class="col-md-6 mb-3">
              <label class="form-label small text-muted">Course Banner Image</label>
              <input type="file" class="form-control bg-dark text-white border-secondary mb-2" (change)="uploadMedia($event, 'image')">
              @if (imageUploadLoading()) {
                <span class="spinner-border spinner-border-sm text-primary me-2"></span>
              }
              @if (courseForm.imageUrl) {
                <img [src]="courseForm.imageUrl" alt="Preview" class="img-thumbnail mt-2 d-block" style="max-height: 100px;">
              }
            </div>

            <!-- Promo video upload -->
            <div class="col-md-6 mb-3">
              <label class="form-label small text-muted">Promo Trailer Video</label>
              <input type="file" class="form-control bg-dark text-white border-secondary mb-2" (change)="uploadMedia($event, 'video')">
              @if (videoUploadLoading()) {
                <span class="spinner-border spinner-border-sm text-primary me-2"></span>
              }
              @if (courseForm.promoVideoUrl) {
                <video [src]="courseForm.promoVideoUrl" controls class="img-thumbnail mt-2 d-block" style="max-height: 100px;"></video>
              }
            </div>
          </div>

          <button type="submit" class="btn btn-primary px-4 py-2 mt-2" [disabled]="!profileForm.valid || courseForm.categoryId === 0">
            {{ isEditMode() ? 'Update Profile' : 'Create Profile & Continue' }}
          </button>
        </form>
      </div>

      <!-- Syllabus Builder (Only visible when Course already created) -->
      @if (isEditMode() && courseId()) {
        <!-- Add Section Card -->
        <div class="card bg-dark border-secondary p-4 mb-4 shadow">
          <h4 class="text-white fw-bold mb-3">Add Course Section</h4>
          <div class="input-group">
            <input type="text" class="form-control bg-dark text-white border-secondary" 
                   placeholder="e.g. Chapter 1: Foundations" [(ngModel)]="newSectionTitle">
            <button class="btn btn-primary" type="button" (click)="addSection()" [disabled]="!newSectionTitle.trim()">
              Create Section
            </button>
          </div>
        </div>

        <!-- Syllabus Outline Accordion -->
        <h4 class="text-white fw-bold mt-5 mb-3">Syllabus Curriculum</h4>
        <div class="accordion border-secondary bg-dark-card" id="syllabusBuilderAccordion">
          @for (sec of sections(); track sec.id) {
            <div class="accordion-item bg-dark border-secondary text-white">
              <h2 class="accordion-header">
                <button class="accordion-button bg-dark text-white" type="button" data-bs-toggle="collapse" [attr.data-bs-target]="'#buildCollapse' + sec.id">
                  <span class="fw-bold">{{ sec.title }}</span>
                </button>
              </h2>
              <div [id]="'buildCollapse' + sec.id" class="accordion-collapse collapse show" data-bs-parent="#syllabusBuilderAccordion">
                <div class="accordion-body bg-dark-card">
                  <!-- Existing Lessons List -->
                  @if (sec.lessons.length > 0) {
                    <ul class="list-group border-secondary mb-4">
                      @for (les of sec.lessons; track les.id) {
                        <li class="list-group-item bg-dark border-secondary text-light d-flex justify-content-between align-items-center">
                          <div>
                            <span class="fw-bold small">{{ les.title }}</span>
                            @if (les.videoUrl) {
                              <span class="badge bg-success ms-2 small">Video Uploaded</span>
                            }
                            @if (les.freePreview) {
                              <span class="badge bg-info ms-2 small">Free Preview</span>
                            }
                          </div>
                        </li>
                      }
                    </ul>
                  }

                  <!-- Add Lesson Form -->
                  <div class="card bg-dark p-3 border-secondary rounded mt-3">
                    <h6 class="text-white fw-bold mb-3">Add Lesson to {{ sec.title }}</h6>
                    
                    <div class="mb-2">
                      <input type="text" class="form-control form-control-sm bg-dark text-white border-secondary" 
                             placeholder="Lesson Title" [(ngModel)]="lessonForms[sec.id || 0].title">
                    </div>
                    <div class="mb-2">
                      <textarea class="form-control form-control-sm bg-dark text-white border-secondary" rows="2"
                                placeholder="Text content/notes" [(ngModel)]="lessonForms[sec.id || 0].content"></textarea>
                    </div>
                    <div class="row g-2 align-items-center mb-2">
                      <div class="col-sm-6">
                        <input type="file" class="form-control form-control-sm bg-dark text-white border-secondary" 
                               (change)="uploadLessonVideo($event, sec.id || 0)">
                      </div>
                      <div class="col-sm-6 text-end">
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="checkbox" [id]="'previewCheck' + sec.id" 
                                 [(ngModel)]="lessonForms[sec.id || 0].freePreview">
                          <label class="form-check-label small text-muted" [for]="'previewCheck' + sec.id">Free Preview</label>
                        </div>
                      </div>
                    </div>
                    @if (lessonVideoLoading[sec.id || 0]) {
                      <div class="small text-primary mb-2">
                        <span class="spinner-border spinner-border-sm me-1"></span> Uploading video...
                      </div>
                    }

                    <button class="btn btn-primary btn-sm px-3 mt-1" type="button" 
                            [disabled]="!lessonForms[sec.id || 0].title.trim()" (click)="addLesson(sec.id || 0)">
                      Save Lesson
                    </button>
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
  `]
})
export class CreateCourseComponent implements OnInit {
  isEditMode = signal<boolean>(false);
  courseId = signal<number | null>(null);
  categories = signal<Category[]>([]);
  sections = signal<Section[]>([]);

  // Course Profile Form Model
  courseForm: Course = {
    title: '',
    subtitle: '',
    description: '',
    price: 0,
    imageUrl: '',
    promoVideoUrl: '',
    categoryId: 0,
    published: false,
    approved: false
  };

  imageUploadLoading = signal<boolean>(false);
  videoUploadLoading = signal<boolean>(false);

  // Syllabus builder models
  newSectionTitle = '';
  // Stores active temporary lesson form data mapped by sectionId
  lessonForms: { [sectionId: number]: Lesson } = {};
  lessonVideoLoading: { [sectionId: number]: boolean } = {};

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    this.loadCategories();
    
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.courseId.set(Number(id));
      this.loadCourseDetails(Number(id));
    }
  }

  loadCategories(): void {
    this.courseService.getCategories().subscribe(res => this.categories.set(res));
  }

  loadCourseDetails(id: number): void {
    this.courseService.getCourseById(id).subscribe({
      next: (res) => {
        this.courseForm = res;
        this.sections.set(res.sections || []);
        
        // Initialize lesson form slots
        res.sections?.forEach(sec => {
          if (sec.id) {
            this.lessonForms[sec.id] = { title: '', content: '', videoUrl: '', videoDuration: 0, freePreview: false, sortOrder: 0 };
            this.lessonVideoLoading[sec.id] = false;
          }
        });
      }
    });
  }

  saveCourseProfile(): void {
    if (this.isEditMode() && this.courseId()) {
      this.courseService.updateCourse(this.courseId()!, this.courseForm).subscribe({
        next: () => alert('Course profile updated successfully!')
      });
    } else {
      this.courseService.createCourse(this.courseForm).subscribe({
        next: (created) => {
          alert('Course profile created! Now build your syllabus.');
          this.router.navigate(['/instructor/create-course', created.id]);
        }
      });
    }
  }

  uploadMedia(event: any, target: 'image' | 'video'): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', target);

    if (target === 'image') this.imageUploadLoading.set(true);
    if (target === 'video') this.videoUploadLoading.set(true);

    this.http.post(`${environment.apiUrl}/api/test/upload`, formData, { responseType: 'text' }).subscribe({
      next: (url) => {
        if (target === 'image') {
          this.courseForm.imageUrl = url;
          this.imageUploadLoading.set(false);
        } else {
          this.courseForm.promoVideoUrl = url;
          this.videoUploadLoading.set(false);
        }
      },
      error: () => {
        this.imageUploadLoading.set(false);
        this.videoUploadLoading.set(false);
      }
    });
  }

  addSection(): void {
    const cid = this.courseId();
    if (!cid) return;

    const newSec: Section = {
      title: this.newSectionTitle,
      sortOrder: this.sections().length + 1,
      lessons: []
    };

    this.courseService.addSection(cid, newSec).subscribe(updatedCourse => {
      this.sections.set(updatedCourse.sections || []);
      this.newSectionTitle = '';
      
      // Update form slots
      updatedCourse.sections?.forEach(sec => {
        if (sec.id && !this.lessonForms[sec.id]) {
          this.lessonForms[sec.id] = { title: '', content: '', videoUrl: '', videoDuration: 0, freePreview: false, sortOrder: 0 };
          this.lessonVideoLoading[sec.id] = false;
        }
      });
    });
  }

  uploadLessonVideo(event: any, sectionId: number): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'video');

    this.lessonVideoLoading[sectionId] = true;

    this.http.post(`${environment.apiUrl}/api/test/upload`, formData, { responseType: 'text' }).subscribe({
      next: (url) => {
        this.lessonForms[sectionId].videoUrl = url;
        this.lessonForms[sectionId].videoDuration = 180; // mock duration: 3 mins
        this.lessonVideoLoading[sectionId] = false;
      },
      error: () => {
        this.lessonVideoLoading[sectionId] = false;
      }
    });
  }

  addLesson(sectionId: number): void {
    const cid = this.courseId();
    if (!cid) return;

    const les = this.lessonForms[sectionId];
    les.sortOrder = this.sections().find(s => s.id === sectionId)?.lessons.length || 0 + 1;

    this.courseService.addLesson(cid, sectionId, les).subscribe(updatedCourse => {
      this.sections.set(updatedCourse.sections || []);
      // Reset form slot
      this.lessonForms[sectionId] = { title: '', content: '', videoUrl: '', videoDuration: 0, freePreview: false, sortOrder: 0 };
    });
  }
}
