import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private BASE_URL = 'https://localhost:7164/api/Auth';

  // התחברות לשרת
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE_URL}/login`, { email, password });
  }

  // שמירת טוקן
  saveToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }

  // קבלת טוקן
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // התנתקות
  logout() {
    localStorage.removeItem('jwtToken');
  }

  // בדיקה אם מחובר
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // קבלת headers עם טוקן
  getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // קבלת מזהה משתמש מטוקן
  getUserIdFromToken(): number {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // חיפוש מזהה המשתמש בטוקן
      for (let key in payload) {
        if (key.includes('nameidentifier')) {
          return parseInt(payload[key]);
        }
      }
    }
    return 0;
  }

  // קבלת תפקיד מטוקן
  getUserRoleFromToken(): string {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // חיפוש תפקיד בטוקן
      for (let key in payload) {
        if (key.includes('role')) {
          return payload[key];
        }
      }
    }
    return 'User';
  }

  // בדיקה אם מנהל
  isManager(): boolean {
    return this.getUserRoleFromToken() === 'Manager';
  }
}
