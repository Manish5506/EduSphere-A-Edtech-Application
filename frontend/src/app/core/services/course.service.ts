import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id?: number;
  name: string;
  description: string;
  slug: string;
}

export interface Lesson {
  id?: number;
  title: string;
  content: string;
  videoUrl: string;
  videoDuration: number;
  freePreview: boolean;
  sortOrder: number;
}

export interface Section {
  id?: number;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

export interface Course {
  id?: number;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  imageUrl: string;
  promoVideoUrl: string;
  published: boolean;
  approved: boolean;
  instructorId?: number;
  instructorName?: string;
  categoryId: number;
  categoryName?: string;
  sections?: Section[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api`;

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  // Courses Browsing
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`);
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${id}`);
  }

  searchCourses(query: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/search?query=${query}`);
  }

  getCoursesByCategory(categoryId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/category/${categoryId}`);
  }

  // Instructor Management
  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/my-courses`);
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, course);
  }

  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/courses/${id}`, course);
  }

  publishCourse(id: number, published: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/courses/${id}/publish?published=${published}`, {}, { responseType: 'text' });
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}`, { responseType: 'text' });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { responseType: 'text' });
  }

  // Sections & Lessons
  addSection(courseId: number, section: Section): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses/${courseId}/sections`, section);
  }

  addLesson(courseId: number, sectionId: number, lesson: Lesson): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses/${courseId}/sections/${sectionId}/lessons`, lesson);
  }

  // Admin approvals
  getPendingCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses/pending`);
  }

  approveCourse(courseId: number, approved: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/courses/${courseId}/approve?approved=${approved}`, {}, { responseType: 'text' });
  }
}
