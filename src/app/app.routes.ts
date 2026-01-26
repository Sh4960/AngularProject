import { Routes } from '@angular/router';
import { Login } from './components/login/login/login';
import { Register } from './components/register/register/register';
import { GiftsList } from './components/gifts/gifts-list/gifts-list';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'gifts', component: GiftsList }
];
