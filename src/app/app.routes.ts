import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { UserList } from './components/user-list/user-list';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'users', component: UserList },
  { path: '**', redirectTo: 'login' }
];
