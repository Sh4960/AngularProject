import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  
  router = inject(Router);
  authSrv = inject(AuthService);

  isLoggedIn(): boolean {
    return this.authSrv.isLoggedIn();
  }

  isManager(): boolean {
    return this.authSrv.isManager();
  }

  logout() {
    this.authSrv.logout();
    this.router.navigate(['/gifts']);
  }
}
