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
  private authService = inject(AuthService);
  private router = inject(Router);

  // שדות קלט למייל וסיסמה שמקושרים ל-ngModel שבHTML
  email = '';
  password = '';
  errorMsg = '';

  login() {
    // איפוס הודעת השגיאה לפני ניסיון התחברות חדש
    this.errorMsg = '';
    this.authService.login(this.email, this.password).subscribe({
      // אם ההתחברות הצליחה – שומרים את הטוקן ב-localStorage
         next: res => {
      this.authService.saveToken(res.token); // שמירת טוקן
      if (this.authService.isLoggedIn()) {    // בדיקה אם ההתחברות הצליחה
        this.router.navigate(['/gifts']);    // ניווט אוטומטי
      }
    },    
      // אם יש שגיאה – מפענחים ומציגים הודעת שגיאה מתאימה
      error: err => {
        // // רישום שגיאה לקונסול
        // console.error('Login error', err);
        // ברירת מחדל להודעת שגיאה
        let msg = 'Login failed';
        // אם אין חיבור לשרת
        if (!err) msg = 'Unknown error';
        else if (err.status === 0) msg = 'Network error: cannot reach server';
        else if (err.status === 401 || err.status === 403) {
          // טיפול ב-Unathorized או Forbidden
          // משתמש לא מורשה
          if (err?.error) {
            if (typeof err.error === 'string') msg = err.error;
            else if (err.error.Message) msg = String(err.error.Message);
            else if (err.error.message) msg = String(err.error.message);
            else {
              try { msg = JSON.stringify(err.error); } catch { msg = String(err.error); }
            }
          } else msg = 'Not authorized';
        } else if (err?.error) {
          // טיפול ב-BadRequest או שגיאות אחרות
          if (typeof err.error === 'string') msg = err.error;
          else if (err.error.Message) msg = String(err.error.Message);
          else if (err.error.message) msg = String(err.error.message);
          else if (err.error.Errors) {
            // InvalidModelStateResponseFactory returns Errors enumerable of {Field, Message}
            try {
              const list = Array.from(err.error.Errors).map((e: any) => e.Message ?? e.Message ?? `${e.Field}: ${e.Message}`);
              msg = list.join(', ');
            } catch {
              try { msg = JSON.stringify(err.error.Errors); } catch { msg = String(err.error.Errors); }
            }
          } else {
            try { msg = JSON.stringify(err.error); } catch { msg = String(err.error); }
          }
        } else msg = err.message ?? msg;

        this.errorMsg = msg;
      }
    });
  }
}
