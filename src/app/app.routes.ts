import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'album/:slug',
    loadComponent: () => import('./album/album.component').then(m => m.AlbumComponent)
  },
  {
    path: 'camera',
    loadComponent: () => import('./camera/camera.component').then(m => m.CameraComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./events/events.component').then(m => m.EventsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/create',
    loadComponent: () => import('./events/create-event.component').then(m => m.CreateEventComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/event/:slug',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/media',
    loadComponent: () => import('./media/media.component').then(m => m.MediaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  }
];
