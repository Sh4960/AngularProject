import { Component, inject } from '@angular/core';
import { DonorService } from '../../../services/donor-service';
import { DonorModel } from '../../../models/donor-model';
import { DonorFilterDTO } from '../../../models/donor-filter.model';
import { Donor } from '../donor/donor';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-donors-list',
  standalone: true,
  imports: [Donor, CommonModule, FormsModule],
  templateUrl: './donors-list.html',
  styleUrl: './donors-list.scss'
})
export class DonorsList {

  // זריקת שירותים
  donorSrv: DonorService = inject(DonorService);
  authSrv: AuthService = inject(AuthService);
  
  // משתני רכיב
  donors$: Observable<DonorModel[]> = this.donorSrv.getAllDonors();
  id: number = -1; // קוד תורם לעריכה
  errorMsg: string = ''; // הודעת שגיאה


  // מסננים
  filter: DonorFilterDTO = {
    name: '',
    email: '',
    giftName: ''
  };


  
  ngOnInit() {
    this.loadDonors();
  }

  onDonorSaved(newId: number) {
    this.id = newId; 
    this.loadDonors();
  }

  loadDonors() {
    this.errorMsg = '';
    this.donors$ = this.donorSrv.getAllDonors();
  }


  applyFilters() {
    this.errorMsg = '';
    const filterDTO: DonorFilterDTO = {};
    
    if (this.filter.name?.trim()) filterDTO.name = this.filter.name.trim();
    if (this.filter.email?.trim()) filterDTO.email = this.filter.email.trim();
    if (this.filter.giftName?.trim()) filterDTO.giftName = this.filter.giftName.trim();

    // אם יש לפחות סינון אחד, השתמש ב-API מסונן
    if (Object.keys(filterDTO).length > 0) {
      this.donors$ = this.donorSrv.getFilteredDonors(filterDTO);
    } else {
      // אחרת, הצג את כל התורמים
      this.loadDonors();
    }
  }

  clearFilters() {
    this.filter = { name: '', email: '', giftName: '' };
    this.loadDonors();
  }
  
  addDonor(donor: DonorModel) {
    this.donorSrv.addDonor(donor).subscribe({
      next: () => {
        this.loadDonors();
      },
      error: (err) => {
        this.errorMsg = err.error || 'Error adding donor';
      }
    });
  }
  
  removeDonor(donorID: number) {
    if (confirm('Are you sure you want to delete?')) {
      this.donorSrv.removeDonor(donorID).subscribe({
        next: () => {
          this.loadDonors();
        },
        error: (err) => {
          this.errorMsg = err.error || 'Error deleting donor';
        }
      });
    }
  }
  
  updateDonor(donorID: number) {
    this.id = donorID;
  }

  trackById(index: number, donor: DonorModel): number {
    return donor.id;
  }

  // בדיקה אם המשתמש מנהל
  isManager(): boolean {
    return this.authSrv.isManager();
  }
}
