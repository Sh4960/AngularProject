import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Donor } from './components/donors/donor/donor';
import { Gift } from './components/gifts/gift/gift';
import { GiftsList } from './components/gifts/gifts-list/gifts-list';
import { Login } from "./components/login/login/login";
import { Register } from "./components/register/register/register";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Gift, Donor, GiftsList, Login, Register, Login],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('project');
}
