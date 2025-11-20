import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home.component').then(m => m.HomeComponent)
  },
  {
    path: 'camera',
    loadComponent: () => import('./camera.component').then(m => m.CameraComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup.component').then(m => m.SignupComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./events.component').then(m => m.EventsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/create',
    loadComponent: () => import('./create-event.component').then(m => m.CreateEventComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/event',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/media',
    loadComponent: () => import('./media.component').then(m => m.MediaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/settings',
    loadComponent: () => import('./settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  }
];
