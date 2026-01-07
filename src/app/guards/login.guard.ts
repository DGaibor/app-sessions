import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map, switchMap, take } from 'rxjs/operators';

export const loginGuard: CanActivateFn = () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  return supabaseService.waitForInit().pipe(
    switchMap(() => supabaseService.user$.pipe(take(1))),
    map(user => {
      if (user) {
        router.navigate(['/app']);
        return false;
      }
      return true;
    })
  );
};
