import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalUsers?: number;
  totalInstructors?: number;
  totalStudents?: number;
  totalRevenue?: number;
  totalCourses?: number;

  myCoursesCount?: number;
  myStudentsCount?: number;
  myEarnings?: number;

  myEnrollmentsCount?: number;
  completedCoursesCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/dashboard`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
