import { Component, inject } from '@angular/core';
import { DonorService } from '../../../services/donor-service';
import { DonorModel } from '../../../models/donor-model';
import { Donor } from '../donor/donor';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-donors-list',
  standalone: true,
  imports: [Donor,CommonModule],
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
