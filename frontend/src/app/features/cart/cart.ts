import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/authentication/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container my-5 flex-grow-1">
      <h1 class="fw-bold text-white mb-4">Shopping Cart</h1>

      @if (paymentService.cartItems().length === 0) {
        <div class="card bg-dark border-secondary p-5 text-center my-4">
          <h4 class="text-white mb-3">Your Cart is Empty</h4>
          <p class="text-muted mb-4">You haven't added any courses to your shopping cart yet.</p>
          <a routerLink="/courses" class="btn btn-primary px-4 py-2 align-self-center">Browse Courses</a>
        </div>
      } @else {
        <div class="row g-4">
          <!-- Cart List -->
          <div class="col-lg-8">
            <div class="d-flex flex-column gap-3">
              @for (item of paymentService.cartItems(); track item.id) {
                <div class="card bg-dark-card border-secondary p-3 d-flex flex-row align-items-center gap-3">
                  <img [src]="item.imageUrl || 'assets/course-placeholder.jpg'" alt="Course Thumbnail" 
                       style="width: 100px; height: 70px; object-fit: cover; border-radius: 6px;">
                  <div class="flex-grow-1 min-w-0">
                    <h5 class="text-white fw-bold text-truncate mb-1">{{ item.title }}</h5>
                    <div class="small text-muted text-truncate">By {{ item.instructorName }}</div>
                  </div>
                  <div class="text-end">
                    <span class="fs-5 fw-bold text-gradient d-block mb-1">₹{{ item.price }}</span>
                    @if (item.id) {
                      <button (click)="removeItem(item.id)" class="btn btn-link text-danger p-0 text-decoration-none small">Remove</button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Checkout Box -->
          <div class="col-lg-4">
            <div class="card bg-dark border-secondary p-4 shadow">
              <h4 class="text-white fw-bold mb-3">Order Summary</h4>
              <div class="d-flex justify-content-between text-muted mb-3">
                <span>Subtotal</span>
                <span>₹{{ paymentService.cartTotal() }}</span>
              </div>
              <div class="d-flex justify-content-between text-white fw-bold fs-5 border-top border-secondary pt-3 mb-4">
                <span>Total</span>
                <span>₹{{ paymentService.cartTotal() }}</span>
              </div>

              @if (errorMsg) {
                <div class="alert alert-danger py-2 small" role="alert">
                  {{ errorMsg }}
                </div>
              }

              <button (click)="onCheckout()" class="btn btn-primary w-100 py-3 fw-bold" [disabled]="checkoutLoading">
                @if (checkoutLoading) {
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing Payment...
                } @else {
                  Proceed to Checkout
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Simulating Payment Modal (Fallback for mock checkout) -->
    <div class="modal fade" id="mockPaymentModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary text-white">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold">EduSphere Payment Simulation</h5>
          </div>
          <div class="modal-body text-center py-4">
            <p>Mock Payment credentials detected. We are simulating a secure transaction via Razorpay gateway.</p>
            <div class="spinner-grow text-primary my-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted small mb-0">Total Amount: ₹{{ paymentService.cartTotal() }}</p>
          </div>
          <div class="modal-footer border-secondary">
            <button (click)="submitMockPayment()" class="btn btn-success w-100 py-2">Authorize Simulated Payment</button>
          </div>
        </div>
      </div>
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
export class CartComponent {
  checkoutLoading = false;
  errorMsg = '';
  mockOrderId = '';

  paymentService = inject(PaymentService);
  authService = inject(AuthService);
  private router = inject(Router);

  removeItem(id: number): void {
    this.paymentService.removeFromCart(id);
  }

  onCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }

    this.checkoutLoading = true;
    this.errorMsg = '';

    const courseIds = this.paymentService.cartItems()
      .map(item => item.id)
      .filter((id): id is number => id !== undefined);

    this.paymentService.initiateOrder(courseIds).subscribe({
      next: (order) => {
        this.mockOrderId = order.razorpayOrderId;
        
        // Handle mock payment order fallback
        if (order.razorpayOrderId.startsWith('order_mock_')) {
          this.checkoutLoading = false;
          this.openMockPaymentModal();
        } else {
          // Actual Razorpay checkout flow
          this.paymentService.loadRazorpayScript().then(loaded => {
            if (!loaded) {
              this.checkoutLoading = false;
              this.errorMsg = 'Could not load Razorpay SDK. Check your internet connection.';
              return;
            }
            this.launchRazorpaySDK(order);
          });
        }
      },
      error: (err) => {
        this.checkoutLoading = false;
        this.errorMsg = err.error?.message || 'Checkout failed. Please try again.';
      }
    });
  }

  private launchRazorpaySDK(order: any): void {
    const user = this.authService.currentUser();
    const options = {
      key: 'placeholder', // Razorpay parses key from backend-side generated orders
      amount: order.amount * 100,
      currency: order.currency,
      name: 'EduSphere',
      description: 'Course Checkout',
      order_id: order.razorpayOrderId,
      prefill: {
        name: user ? `${user.firstName} ${user.lastName}` : '',
        email: user ? user.email : ''
      },
      theme: {
        color: '#0d6efd'
      },
      handler: (response: any) => {
        this.verifyTransaction(response);
      },
      modal: {
        ondismiss: () => {
          this.checkoutLoading = false;
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  private verifyTransaction(response: any): void {
    const payload = {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    };

    this.paymentService.verifyPayment(payload).subscribe({
      next: () => {
        this.checkoutLoading = false;
        this.paymentService.clearCart();
        this.router.navigate(['/student/my-courses']);
      },
      error: (err) => {
        this.checkoutLoading = false;
        this.errorMsg = 'Verification failed: ' + (err.error?.message || 'Please contact support.');
      }
    });
  }

  // --- MOCK PAYMENT HELPER MODAL SIMULATOR ---

  private openMockPaymentModal(): void {
    const modalElement = document.getElementById('mockPaymentModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  private closeMockPaymentModal(): void {
    const modalElement = document.getElementById('mockPaymentModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  submitMockPayment(): void {
    this.closeMockPaymentModal();
    this.checkoutLoading = true;

    // Build dummy Razorpay credentials
    const dummyPaymentResponse = {
      razorpay_order_id: this.mockOrderId,
      razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 14),
      razorpay_signature: 'sig_mock_' + Math.random().toString(36).substring(2, 14)
    };

    this.verifyTransaction(dummyPaymentResponse);
  }
}
