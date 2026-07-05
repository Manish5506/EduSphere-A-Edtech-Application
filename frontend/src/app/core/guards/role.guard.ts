import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles: string[] = route.data['expectedRoles'];
  const user = authService.currentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Check if user has at least one of the expected roles
  const hasAccess = expectedRoles.some(role => authService.hasRole(role));

  if (hasAccess) {
    return true;
  }

  // Redirect to home/unauthorized page if role is insufficient
  router.navigate(['/']);
  return false;
};
