import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/app', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  { 
    path: 'app', 
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent), 
    canActivate: [authGuard] 
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];
