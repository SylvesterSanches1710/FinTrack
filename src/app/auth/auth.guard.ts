import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = (
  route,

  state,
) => {
  const auth = inject(Auth);

  const router = inject(Router);

  // CHECK LOGIN

  if (auth.currentUser) {
    return true;
  }

  // REDIRECT

  return router.createUrlTree(['/auth']);
};
