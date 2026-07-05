import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-dark text-light-muted py-4 mt-auto border-top border-secondary">
      <div class="container text-center">
        <div class="row align-items-center justify-content-between">
          <div class="col-md-6 text-md-start mb-2 mb-md-0">
            <span class="fw-bold text-gradient">EduSphere</span> &copy; 2026. All rights reserved.
          </div>
          <div class="col-md-6 text-md-end">
            <a routerLink="/courses" class="text-light-muted me-3 text-decoration-none hover-white">All Courses</a>
            <a routerLink="/" class="text-light-muted text-decoration-none hover-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .text-light-muted {
      color: #8c98a5;
    }
    .hover-white:hover {
      color: #fff;
    }
    .text-gradient {
      background: linear-gradient(135deg, #0d6efd, #0dcaf0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class FooterComponent {}
