import { Component, inject } from '@angular/core';
import { DonorService } from '../../../services/donor-service';
import { DonorModel } from '../../../models/donor-model';
import { Donor } from '../donor/donor';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-donors-list',
  standalone: true,
  imports: [Donor,CommonModule],
  templateUrl: './donors-list.html',
  styleUrl: './donors-list.scss'
})
export class DonorsList {

  donorsArr: DonorModel[] = [];
  donorSrv: DonorService = inject(DonorService);
  id: number = -1;

  
  ngOnInit() {
    this.loadDonors(); // קריאה ראשונית
  }

  onDonorSaved(newId: number) {
    this.id = newId; 
    this.loadDonors(); // מרענן את הרשימה מהשרת
  }

  loadDonors() {
    this.donorSrv.getAllDonors().subscribe({
      next: (donors) => this.donorsArr = donors,
      error: err => {
        console.error('Load donors error', err);
        let msg = 'Failed to load donors';
        if (!err) msg = 'Unknown error';
        else if (err.status === 0) msg = 'Network error: cannot reach server';
        else if (err.status === 401 || err.status === 403) msg = 'Not authorized';
        else if (err?.error) {
          if (typeof err.error === 'string') msg = err.error;
          else if (err.error.message) msg = String(err.error.message);
          else if (err.error.Message) msg = String(err.error.Message);
          else {
            try { msg = JSON.stringify(err.error); } catch { msg = String(err.error); }
          }
        } else msg = err.message ?? msg;

        console.error('Error message:', msg);
      }
    });
  }

  removeDonor(donorID: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק?')) {
      this.donorSrv.removeDonor(donorID).subscribe({
        next: () => this.loadDonors(),
        error: err => {
          console.error('Remove donor error', err);
          let msg = 'Failed to remove donor';
          if (!err) msg = 'Unknown error';
          else if (err.status === 0) msg = 'Network error: cannot reach server';
          else if (err.status === 401 || err.status === 403) msg = 'Not authorized';
          else if (err?.error) {
            if (typeof err.error === 'string') msg = err.error;
            else if (err.error.message) msg = String(err.error.message);
            else if (err.error.Message) msg = String(err.error.Message);
            else { try { msg = JSON.stringify(err.error); } catch { msg = String(err.error); } }
          } else msg = err.message ?? msg;

          console.error('Error message:', msg);
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
}
