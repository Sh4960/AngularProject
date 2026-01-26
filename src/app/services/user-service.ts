import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth-service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private BASE_URL = 'https://localhost:7164/api/User';

  // פונקציה שמחזירה כותרות עם טוקן אם קיים
  private authHeaders() {
    const token = this.auth.getToken();
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  // הרשמה – לא דורש טוקן
  register(user: any): Observable<any> {
    return this.http.post(this.BASE_URL, user);
  }

  // דוגמה ל־GET של כל המשתמשים – דורש Manager
  getAllUsers(): Observable<any> {
    return this.http.get(this.BASE_URL, this.authHeaders());
  }
}
  