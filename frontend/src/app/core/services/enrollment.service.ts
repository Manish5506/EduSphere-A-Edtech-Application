import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Course } from './course.service';

export interface LessonProgress {
  id: number;
  lessonId: number;
  completed: boolean;
  updatedAt: string;
  lesson: any;
}

export interface Enrollment {
  id: number;
  course: Course;
  progress: number;
  completed: boolean;
  completedAt: string;
  enrolledAt: string;
  lessonProgressList: LessonProgress[];
}

export interface Certificate {
  id: number;
  certificateUuid: string;
  course: Course;
  student?: any;
  issuedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api`;

  getMyCourses(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments/my-courses`);
  }

  getEnrollmentDetails(courseId: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/enrollments/course/${courseId}`);
  }

  updateLessonProgress(courseId: number, lessonId: number, completed: boolean): Observable<Enrollment> {
    return this.http.put<Enrollment>(
      `${this.apiUrl}/enrollments/course/${courseId}/lessons/${lessonId}/progress?completed=${completed}`,
      {}
    );
  }

  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.apiUrl}/certificates/my-certificates`);
  }

  verifyCertificate(uuid: string): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.apiUrl}/certificates/verify/${uuid}`);
  }
}
