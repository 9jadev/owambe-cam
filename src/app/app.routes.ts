import { Routes } from '@angular/router';

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
    loadComponent: () => import('./login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./events.component').then(m => m.EventsComponent)
  },
  {
    path: 'dashboard/create',
    loadComponent: () => import('./create-event.component').then(m => m.CreateEventComponent)
  },
  {
    path: 'dashboard/event',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'dashboard/media',
    loadComponent: () => import('./media.component').then(m => m.MediaComponent)
  },
  {
    path: 'dashboard/settings',
    loadComponent: () => import('./settings.component').then(m => m.SettingsComponent)
  }
];
