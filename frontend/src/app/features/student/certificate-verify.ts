import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnrollmentService, Certificate } from '../../core/services/enrollment.service';

@Component({
  selector: 'app-certificate-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container my-5 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Verifying Certificate...</span>
          </div>
          <p class="text-muted mt-2">Connecting to block verification database...</p>
        </div>
      } @else if (errorMsg()) {
        <div class="card bg-dark border-danger p-5 text-center shadow-lg" style="max-width: 480px;">
          <div class="text-danger mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-shield-x" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2m3 4V3a3 3 0 0 0-6 0v2H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/>
            </svg>
          </div>
          <h4 class="text-white fw-bold">Invalid Certificate</h4>
          <p class="text-muted small">{{ errorMsg() }}</p>
          <a routerLink="/" class="btn btn-outline-light btn-sm mt-3">Back to Home</a>
        </div>
      } @else if (certificate()) {
        <!-- Verified Header Status -->
        <div class="badge bg-success py-2 px-3 mb-4 rounded-pill d-flex align-items-center gap-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          <span class="fw-bold">Secured & Verified Certificate</span>
        </div>

        <!-- Premium Certificate Canvas Card -->
        <div class="certificate-canvas bg-white text-dark p-5 shadow-lg border border-gold position-relative overflow-hidden mb-4">
          <!-- Background filigree watermark details -->
          <div class="watermark-overlay"></div>

          <div class="text-center position-relative z-index-1">
            <h2 class="certificate-title font-serif text-gold fw-bold mb-1">EduSphere</h2>
            <div class="small tracking-widest text-muted text-uppercase mb-4">Academy of Learning Excellence</div>
            
            <div class="text-muted font-italic my-4">This certificate of completion is awarded to</div>
            
            <h1 class="student-name font-serif fw-bold my-4 border-bottom border-dark pb-2 d-inline-block px-5">
              {{ certificate()?.student?.firstName }} {{ certificate()?.student?.lastName }}
            </h1>
            
            <div class="text-muted font-italic mb-3">for successfully completing all requirements of the course</div>
            
            <h3 class="course-title fw-bold text-dark mb-4">{{ certificate()?.course?.title }}</h3>

            <div class="row mt-5 pt-4 align-items-end justify-content-center">
              <div class="col-sm-4 text-center">
                <div class="font-serif text-dark small border-bottom border-secondary pb-1 mx-3">EduSphere Registrar</div>
                <div class="small text-muted mt-1">Authorized Signature</div>
              </div>
              <div class="col-sm-4 text-center my-3 my-sm-0">
                <!-- Gold Seal -->
                <div class="gold-seal mx-auto d-flex align-items-center justify-content-center">
                  <div class="seal-inner">SEAL</div>
                </div>
              </div>
              <div class="col-sm-4 text-center">
                <div class="font-serif text-dark small border-bottom border-secondary pb-1 mx-3">
                  {{ certificate()?.issuedAt | date:'mediumDate' }}
                </div>
                <div class="small text-muted mt-1">Date of Issuance</div>
              </div>
            </div>

            <!-- Footer Details -->
            <div class="mt-5 pt-3 text-muted small border-top border-light-gray" style="font-size: 0.75rem;">
              Certificate ID: {{ certificate()?.certificateUuid }}
            </div>
          </div>
        </div>
        
        <button (click)="printPage()" class="btn btn-outline-light btn-sm mt-2 px-3 py-2">Print / Save as PDF</button>
      }
    </div>
  `,
  styles: [`
    .border-gold {
      border: 8px double #c9a0dc;
      border-color: #d4af37 !important;
    }
    .certificate-canvas {
      width: 100%;
      max-width: 800px;
      border-radius: 4px;
      min-height: 520px;
      position: relative;
    }
    .watermark-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, rgba(255, 255, 255, 0) 70%);
      pointer-events: none;
    }
    .font-serif {
      font-family: 'Playfair Display', Georgia, serif;
    }
    .text-gold {
      color: #b8901c;
    }
    .tracking-widest {
      letter-spacing: 0.15em;
    }
    .gold-seal {
      width: 75px;
      height: 75px;
      border-radius: 50%;
      background: radial-gradient(circle, #f3e5ab 0%, #d4af37 100%);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 2px dashed #b8901c;
    }
    .seal-inner {
      font-size: 0.7rem;
      font-weight: bold;
      color: #7b6211;
      letter-spacing: 0.05em;
    }
    .z-index-1 {
      position: relative;
      z-index: 1;
    }
  `]
})
export class CertificateVerifyComponent implements OnInit {
  certificate = signal<Certificate | null>(null);
  isLoading = signal<boolean>(true);
  errorMsg = signal<string>('');

  private route = inject(ActivatedRoute);
  private enrollmentService = inject(EnrollmentService);

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (!uuid) {
      this.isLoading.set(false);
      this.errorMsg.set('No certificate verifier identifier supplied.');
      return;
    }

    this.enrollmentService.verifyCertificate(uuid).subscribe({
      next: (res) => {
        this.certificate.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set('The certificate signature could not be verified in our registry records.');
      }
    });
  }

  printPage(): void {
    window.print();
  }
}
