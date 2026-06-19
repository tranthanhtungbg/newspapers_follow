import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'grammar',
        loadComponent: () => import('./pages/grammar/grammar-topics.component').then(m => m.GrammarTopicsComponent)
      },
      {
        path: 'grammar/topic/:id/lessons',
        loadComponent: () => import('./pages/grammar/grammar-lessons.component').then(m => m.GrammarLessonsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'users/:id/progress',
        loadComponent: () => import('./pages/users/user-progress.component').then(m => m.UserProgressComponent)
      },
      {
        path: 'newspapers',
        loadComponent: () => import('./pages/newspapers/newspapers.component').then(m => m.NewspapersComponent)
      },
      {
        path: 'youtube',
        loadComponent: () => import('./pages/youtube/youtube-manager.component').then(m => m.YoutubeManagerComponent)
      },
      {
        path: 'vocabulary',
        loadComponent: () => import('./pages/vocabulary/vocabulary-manager.component').then(m => m.VocabularyManagerComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
