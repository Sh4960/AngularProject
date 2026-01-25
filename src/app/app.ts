import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Donor } from './components/donors/donor/donor';
import { Gift } from './components/gifts/gift/gift';
import { GiftsList } from './components/gifts/gifts-list/gifts-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Gift,Donor,GiftsList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('project');
}
