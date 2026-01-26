import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// מבנה התגובה מהשרת אחרי התחברות
export interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private BASE_URL = 'https://localhost:7164/api/Auth';

  // פונקציה שמבצעת login לשרת
  // מחזירה Observable עם טוקן
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE_URL}/login`, { email, password });
  }

  //שמירת הטוקן ב-localStorage
  saveToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }

  // שליפת הטוקן
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // מחיקת הטוקן בעת logout
  logout() {
    localStorage.removeItem('jwtToken');
  }

  // בדיקה האם המשתמש מחובר
  // אם יש טוקן – מחובר
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
