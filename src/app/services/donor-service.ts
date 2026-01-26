import { Injectable, inject } from '@angular/core';
import { DonorModel } from '../models/donor-model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DonorService {
    
  BASE_URL: string = 'https://localhost:7164/api/Donor';
  httpClient: HttpClient = inject(HttpClient);

  getAllDonors() {
      return this.httpClient.get<DonorModel[]>(this.BASE_URL);
  }

  addDonor(d:DonorModel){
      return this.httpClient.post<DonorModel>(this.BASE_URL, d);
  }

  updateDonor(d: DonorModel){
      return this.httpClient.put<DonorModel>(`${this.BASE_URL}/${d.id}`, d);
  }

  getDonorById(donorId: number){
      return this.httpClient.get<DonorModel>(this.BASE_URL + '/'+ donorId);
  }

  removeDonor(donorId: number){
      return this.httpClient.delete<void>(`${this.BASE_URL}/${donorId}`);
  }
}
