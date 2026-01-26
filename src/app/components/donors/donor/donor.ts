import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DonorService } from '../../../services/donor-service';
import { DonorModel } from '../../../models/donor-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-donor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './donor.html',
  styleUrl: './donor.scss',
})
export class Donor {

  donorSrv: DonorService = inject(DonorService);

  @Input()
  selectedId: number = -1;

  @Output()
  selectedIdChange: EventEmitter<number> = new EventEmitter<number>();

  frmDonor: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
  });

  serverError: string | null = null;

  saveDonor() {
    this.serverError = null;
    if (this.frmDonor.invalid) {
      this.serverError = 'Form is invalid';
      return;
    }

    const donorDTO: DonorModel = this.frmDonor.value;

    const obs = this.selectedId > 0
      ? this.donorSrv.updateDonor(donorDTO)
      : this.donorSrv.addDonor(donorDTO);

    obs.subscribe({
      next: () => this.selectedIdChange.emit(-1),
      error: (err: any) => {
        console.log('HTTP error', err);
        if (err?.status === 401 || err?.status === 403) {
          this.serverError = 'Not authorized (please login).';
          return;
        }
        // הצג את התוכן שה־API החזיר במדויק (string או JSON stringified)
        const body = err?.error;
        if (body === undefined || body === null) {
          this.serverError = err?.message ?? 'Server error';
        } else if (typeof body === 'string') {
          this.serverError = body;
        } else {
          try {
            this.serverError = JSON.stringify(body);
          } catch {
            this.serverError = String(body);
          }
        }
      }
    });
  }

  ngOnChanges(c: SimpleChanges){
    if(c['selectedId']){
      this.serverError = null;
      if(this.selectedId > 0){
        this.donorSrv.getDonorById(this.selectedId).subscribe((donor) => {
          if (donor) this.frmDonor.setValue(donor);
        });
      } else if(this.selectedId === 0){
        this.frmDonor.reset({
          id: 0,
          name: '',
          email: '',
          phone: ''
        });
      }
    }
  }

  cancel() {
    this.serverError = null;
    if (this.selectedId > 0) {
      this.donorSrv.getDonorById(this.selectedId).subscribe((donor) => {
        if (donor) this.frmDonor.setValue(donor);
      });
    }
  }
}
