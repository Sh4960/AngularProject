import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DonorsList } from './components/donors/donors-list/donors-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,DonorsList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('project');
}
