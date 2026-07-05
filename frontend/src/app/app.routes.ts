import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // --- Guest / Public routes ---
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/course/course-list').then(m => m.CourseListComponent)
      },
      {
        path: 'courses/:id',
        loadComponent: () => import('./features/course/course-details').then(m => m.CourseDetailsComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart').then(m => m.CartComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./features/authentication/login').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/authentication/register').then(m => m.RegisterComponent)
      },
      {
        path: 'certificates/verify/:uuid',
        loadComponent: () => import('./features/student/certificate-verify').then(m => m.CertificateVerifyComponent)
      }
    ]
  },

  // --- Student routes ---
  {
    path: 'student',
    loadComponent: () => import('./layouts/student-layout/student-layout').then(m => m.StudentLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['student'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/student/student-dashboard').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'my-courses',
        loadComponent: () => import('./features/student/student-my-courses').then(m => m.StudentMyCoursesComponent)
      },
      {
        path: 'course/:courseId',
        loadComponent: () => import('./features/student/course-watch').then(m => m.CourseWatchComponent)
      },
      {
        path: 'certificates',
        loadComponent: () => import('./features/student/student-dashboard').then(m => m.StudentDashboardComponent)
      }
    ]
  },

  // --- Instructor routes ---
  {
    path: 'instructor',
    loadComponent: () => import('./layouts/instructor-layout/instructor-layout').then(m => m.InstructorLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['instructor'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/instructor/instructor-dashboard').then(m => m.InstructorDashboardComponent)
      },
      {
        path: 'my-courses',
        loadComponent: () => import('./features/instructor/instructor-courses').then(m => m.InstructorCoursesComponent)
      },
      {
        path: 'create-course',
        loadComponent: () => import('./features/instructor/create-course').then(m => m.CreateCourseComponent)
      },
      {
        path: 'create-course/:id',
        loadComponent: () => import('./features/instructor/create-course').then(m => m.CreateCourseComponent)
      }
    ]
  },

  // --- Admin routes ---
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['admin'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'course-approval',
        loadComponent: () => import('./features/admin/course-approval').then(m => m.CourseApprovalComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories').then(m => m.AdminCategoriesComponent)
      }
    ]
  },

  // --- Fallback redirect ---
  {
    path: '**',
    redirectTo: ''
  }
];
