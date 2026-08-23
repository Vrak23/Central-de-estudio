import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabase.getSession();
  if (session) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
