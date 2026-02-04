import { Injectable, inject } from '@angular/core';
import { DonorModel } from '../models/donor-model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class DonorService {
    
  // כתובת בסיס ל-API
  BASE_URL: string = 'https://localhost:7164/api/Donor';
  
  // זריקת שירותים
  httpClient: HttpClient = inject(HttpClient);
  authService: AuthService = inject(AuthService);

  // קבלת כל התורמים
  getAllDonors() {
      return this.httpClient.get<DonorModel[]>(this.BASE_URL, { headers: this.authService.getAuthHeaders() });
  }

  // הוספת תורם חדש
  addDonor(d: any){
      return this.httpClient.post(this.BASE_URL, d, { headers: this.authService.getAuthHeaders(), responseType: 'text' });
  }

  updateDonor(d: any){
      return this.httpClient.put(`${this.BASE_URL}/${d.id}`, d, { headers: this.authService.getAuthHeaders(), responseType: 'text' });
  }

  getDonorById(donorId: number){
      return this.httpClient.get<DonorModel>(this.BASE_URL + '/'+ donorId, { headers: this.authService.getAuthHeaders() });
  }

  removeDonor(donorId: number){
      return this.httpClient.delete<void>(`${this.BASE_URL}/${donorId}`, { headers: this.authService.getAuthHeaders() });
  }
}
