// login.component.ts
import { Component, inject } from '@angular/core';
// מאפשר שימוש ב-ngModel לשדות קלט
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  // זריקת שירותים
  authService = inject(AuthService);
  router = inject(Router);

  // שדות קלט
  email = '';
  password = '';
  errorMsg = '';

  // התחברות
  login() {
    this.errorMsg = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/gifts']);
      },
      error: (err) => {
        // הצגת השגיאה המדויקת מהשרת
        this.errorMsg = err.error || 'Login failed';
      }
    });
  }
}
