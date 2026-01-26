import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private userService = inject(UserService);

  // אובייקט שנשלח ל-API
  user = {userName: '', email: '', password: '', phone: ''};

  // אובייקט שמחזיק את השגיאות
  errors: { [key: string]: string[] } = {userName: [], email: [], password: [], phone: [], general: []};
  
  // הודעה במידה והרישום הצליח
  successMessage: string | null = null;

  // ממפה שגיאות שמגיעות מהשרת למבנה של errors
  private mapModelStateErrors(errorsArray: any) {
    try {
      const list = Array.from(errorsArray);
      list.forEach((e: any) => {
        const fieldRaw = e.Field ?? e.field ?? 'general';
        let field = 'general';
        if (typeof fieldRaw === 'string') {
          const parts = fieldRaw.replace(/^\./, '').split('.');
          const last = parts[parts.length - 1] || 'general';
          field = last.charAt(0).toLowerCase() + last.slice(1);
        }
        const msg = e.Message ?? e.message ?? String(e);
        if (!this.errors[field]) this.errors[field] = [];
        this.errors[field].push(msg);
      });
    } catch {
      this.errors['general'] = [JSON.stringify(errorsArray)];
    }
  }

  // מפענח שגיאות שרת
  private extractAndMapServerErrors(err: any) {
    this.errors = {};
    if (!err) {
      this.errors['general'] = ['Unknown error'];
      return;
    }

    if (err.status === 0) {
      this.errors['general'] = ['Network error: cannot reach server'];
      return;
    }

    if (err.status === 401 || err.status === 403) {
      const body = err.error;
      if (body && typeof body !== 'string') {
        const m = body.Message ?? body.message;
        this.errors['general'] = [m ?? 'Not authorized'];
      } else this.errors['general'] = [body ?? 'Not authorized'];
      return;
    }

    const body = err.error;
    if (!body) {
      this.errors['general'] = [err.message ?? 'Registration failed'];
      return;
    }

    if (typeof body === 'string') {
      this.errors['general'] = [body];
      return;
    }

    const modelErrors = body.Errors ?? body.errors;
    if (modelErrors) {
      this.mapModelStateErrors(modelErrors);
      return;
    }

    if (body.Message || body.message) {
      this.errors['general'] = [String(body.Message ?? body.message)];
      return;
    }
    try { this.errors['general'] = [JSON.stringify(body)]; } catch { this.errors['general'] = [String(body)]; }
  }

  register() {
    // איפוס הודעות שגיאה והצלחה
    this.errors = { userName: [], email: [], password: [], phone: [], general: [] };
    this.successMessage = null;

    // בדיקה בסיסית בצד לקוח
    const clientErrors: { [k: string]: string[] } = {};
    if (!this.user.userName || !this.user.userName.trim()) clientErrors['userName'] = ['User name is required'];
    if (!this.user.email || !this.user.email.trim()) clientErrors['email'] = ['Email is required'];
    if (!this.user.password || !this.user.password.trim()) clientErrors['password'] = ['Password is required'];
    if (!this.user.phone || !this.user.phone.trim()) clientErrors['phone'] = ['Phone is required'];

    if (Object.keys(clientErrors).length) {
      this.errors = clientErrors as any;
      return;// אם יש שגיאות בצד לקוח – עצירה
    }

    // שליחת בקשת הרשמה ל-API
    this.userService.register(this.user).subscribe({
        next: () => {
        // אם ההרשמה הצליחה
        this.successMessage = 'User registered successfully.';
        this.user = { userName: '', email: '', password: '', phone: '' };
        this.errors = { userName: [], email: [], password: [], phone: [], general: [] };
      },
      // אם יש שגיאה ב־HTTP
      error: (err) => {
        //הדפסת השגיאה לקונסול
        console.log('Registration HTTP error', err);
        // מפענח שגיאות מהשרת
        this.extractAndMapServerErrors(err);
        console.error('Registration errors:', this.errors);
      }
    });
  }
}
