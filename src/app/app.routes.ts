import { Routes } from '@angular/router';
import { Login } from './components/login/login/login';
import { Register } from './components/register/register/register';
import { GiftsList } from './components/gifts/gifts-list/gifts-list';
import { DonorsList } from './components/donors/donors-list/donors-list';
import { Shoppings } from './components/shopping/shoppings/shoppings';
import { UsersList } from './components/users/users-list/users-list';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'gifts', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'gifts', component: GiftsList },
  { path: 'donors', component: DonorsList },
  { path: 'shoppings', component: Shoppings },
  { path: 'users', component: UsersList },
  { path: 'profile', component: Profile }

];
