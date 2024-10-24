import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  // {
  //   path: 'home',
  //   canActivate: [authGuard],
  //   component: HomeComponent,
  // },
  {
    path: '**',
    canActivate: [authGuard],
    component: NotFoundComponent,
  },
];
