import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Category } from '../../core/services/course.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-3 container" style="max-width: 800px;">
      <h2 class="fw-bold text-white mb-4">Course Categories</h2>

      <!-- Create Category Form -->
      <div class="card bg-dark border-secondary p-4 mb-4 shadow">
        <h5 class="text-white fw-bold mb-3">Add New Category</h5>
        <form (ngSubmit)="onCreate()" #catForm="ngForm">
          <div class="mb-3">
            <label class="form-label small text-muted">Category Name</label>
            <input type="text" class="form-control bg-dark text-white border-secondary" 
                   [(ngModel)]="newCat.name" name="name" required placeholder="e.g. Design & Illustration">
          </div>
          <div class="mb-3">
            <label class="form-label small text-muted">Description</label>
            <textarea class="form-control bg-dark text-white border-secondary" rows="2"
                      [(ngModel)]="newCat.description" name="description" placeholder="A brief description..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-sm px-4" [disabled]="!catForm.valid">
            Save Category
          </button>
        </form>
      </div>

      <!-- Categories Table -->
      <h4 class="text-white fw-bold mb-3">Existing Categories</h4>
      @if (categories().length === 0) {
        <div class="card bg-dark-card border-secondary p-4 text-center">
          <p class="text-muted mb-0 small">No categories created yet.</p>
        </div>
      } @else {
        <div class="table-responsive border border-secondary rounded">
          <table class="table table-dark table-striped table-hover mb-0 align-middle">
            <thead>
              <tr class="text-muted small">
                <th scope="col" class="ps-3">Name</th>
                <th scope="col">Slug</th>
                <th scope="col">Description</th>
                <th scope="col" class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (cat of categories(); track cat.id) {
                <tr>
                  <td class="ps-3 fw-bold text-gradient">{{ cat.name }}</td>
                  <td class="text-monospace small">{{ cat.slug }}</td>
                  <td class="text-muted small">{{ cat.description }}</td>
                  <td class="text-end pe-3">
                    <button (click)="deleteCategory(cat.id)" class="btn btn-danger btn-sm">Delete</button>
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
    .text-gradient {
      background: linear-gradient(135deg, #0d6efd, #0dcaf0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  newCat: Category = { name: '', description: '', slug: '' };

  private courseService = inject(CourseService);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.courseService.getCategories().subscribe(res => this.categories.set(res));
  }

  onCreate(): void {
    this.courseService.createCategory(this.newCat).subscribe(() => {
      this.loadCategories();
      this.newCat = { name: '', description: '', slug: '' };
    });
  }

  deleteCategory(id?: number): void {
    if (!id || !confirm('Are you sure you want to delete this category?')) return;
    this.courseService.deleteCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => {
        alert(err.error || 'Failed to delete category. Make sure it contains no courses.');
      }
    });
  }
}
