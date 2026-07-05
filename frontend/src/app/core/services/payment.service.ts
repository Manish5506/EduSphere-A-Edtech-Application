import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Course } from './course.service';

export interface RazorpayResponse {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/payments`;

  // Reactive Cart state persisted in localStorage
  cartItems = signal<Course[]>(this.getCartFromStorage());
  cartTotal = signal<number>(this.calculateTotal());

  addToCart(course: Course): void {
    if (this.cartItems().some(item => item.id === course.id)) return;
    this.cartItems.set([...this.cartItems(), course]);
    localStorage.setItem('cart', JSON.stringify(this.cartItems()));
    this.cartTotal.set(this.calculateTotal());
  }

  removeFromCart(courseId: number): void {
    this.cartItems.set(this.cartItems().filter(item => item.id !== courseId));
    localStorage.setItem('cart', JSON.stringify(this.cartItems()));
    this.cartTotal.set(this.calculateTotal());
  }

  clearCart(): void {
    this.cartItems.set([]);
    localStorage.removeItem('cart');
    this.cartTotal.set(0);
  }

  isInCart(courseId: number): boolean {
    return this.cartItems().some(item => item.id === courseId);
  }

  // Razorpay operations
  initiateOrder(courseIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/checkout`, courseIds);
  }

  verifyPayment(verificationData: RazorpayResponse): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, verificationData, { responseType: 'text' });
  }

  // Dynamic Razorpay Script Loader
  loadRazorpayScript(): Promise<boolean> {
    return new Promise(resolve => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  private getCartFromStorage(): Course[] {
    const cartStr = localStorage.getItem('cart');
    if (!cartStr) return [];
    try {
      return JSON.parse(cartStr) as Course[];
    } catch {
      return [];
    }
  }

  private calculateTotal(): number {
    return this.cartItems().reduce((acc, item) => acc + item.price, 0);
  }
}
