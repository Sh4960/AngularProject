import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  // זריקת שירותים  
  userService = inject(UserService);
  authService = inject(AuthService);
  router = inject(Router);

  // נתוני משתמש
  user = {userName: '', email: '', password: '', phone: ''};
  
  // שגיאות לכל שדה
  errors: { [key: string]: string[] } = {userName: [], email: [], password: [], phone: [], general: []};
  successMessage: string | null = null;

  // מפענח שגיאות מהשרת ומשייך לשדות המתאימים
  private extractServerErrors(err: any) {
    this.errors = {userName: [], email: [], password: [], phone: [], general: []};
    
    const body = err?.error;
    
    // אם אין body - שגיאה כללית
    if (!body) {
      this.errors['general'] = [err?.message || 'Registration failed'];
      return;
    }
    
    // אם השגיאה היא string פשוט
    if (typeof body === 'string') {
      this.errors['general'] = [body];
      return;


    }
    
    // אם יש מערך Errors מהשרת (ModelState)
    const modelErrors = body.Errors || body.errors;
    if (modelErrors && Array.isArray(modelErrors)) {
      modelErrors.forEach((e: any) => {
        // מציאת שם השדה
        const fieldRaw = e.Field || e.field || 'general';
        let field = 'general';
        if (typeof fieldRaw === 'string') {
          const parts = fieldRaw.replace(/^\./, '').split('.');
          const last = parts[parts.length - 1] || 'general';
          field = last.charAt(0).toLowerCase() + last.slice(1);
        }
        // הוספת ההודעה לשדה המתאים
        const msg = e.Message || e.message || String(e);
        if (!this.errors[field]) this.errors[field] = [];
        this.errors[field].push(msg);
      });
      return;
    }
    
    // אם יש Message בודד
    if (body.Message || body.message) {
      this.errors['general'] = [body.Message || body.message];
      return;
    }
    
    // אחרת - מציג את כל מה שהשרת החזיר
    this.errors['general'] = [JSON.stringify(body)];
  }

  // רישום משתמש
  register() {
    this.errors = {userName: [], email: [], password: [], phone: [], general: []};
    this.successMessage = null;

    this.userService.register(this.user).subscribe({
      next: () => {
        this.successMessage = 'Registration successful!';
        // התחברות אוטומטית
        this.authService.login(this.user.email, this.user.password).subscribe({
          next: (res) => {
            this.authService.saveToken(res.token);
            this.router.navigate(['/gifts']);
          },
          error: () => this.router.navigate(['/login'])
        });
      },
      error: (err) => this.extractServerErrors(err)
    });
  }
}
