import { Injectable, inject } from '@angular/core';
import { DonorModel } from '../models/donor-model';
import { DonorDTO } from '../models/donor-dto-model';
import { DonorFilterDTO } from '../models/donor-filter.model';
import { HttpClient, HttpParams } from '@angular/common/http';
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
      return this.httpClient.get<DonorDTO[]>(this.BASE_URL, { headers: this.authService.getAuthHeaders() });
  }

  // קבלת תורמים מסוננים
  getFilteredDonors(filter: DonorFilterDTO) {
      let params = new HttpParams();
      if (filter.name) params = params.set('name', filter.name);
      if (filter.email) params = params.set('email', filter.email);
      if (filter.giftName) params = params.set('giftName', filter.giftName);
      
      return this.httpClient.get<DonorDTO[]>(`${this.BASE_URL}/filter`, { 
          headers: this.authService.getAuthHeaders(),
          params: params
      });
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
      return this.httpClient.delete(`${this.BASE_URL}/${donorId}`, { headers: this.authService.getAuthHeaders(), responseType: 'text' });
  }
}
