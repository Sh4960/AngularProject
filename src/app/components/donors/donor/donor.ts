import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DonorService } from '../../../services/donor-service';
import { DonorModel } from '../../../models/donor-model';

@Component({
  selector: 'app-donor',
  imports: [ReactiveFormsModule],
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
    donor_tz: new FormControl('', [Validators.required]),
    donor_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
  });

  saveDonor(){
    let donor: DonorModel = new DonorModel();
    donor.donor_tz = this.frmDonor.controls['donor_tz'].value;
    donor.donor_name = this.frmDonor.controls['donor_name'].value;
    donor.email = this.frmDonor.controls['email'].value;
    donor.phone = this.frmDonor.controls['phone'].value;

    if(this.selectedId > 0)
      this.donorSrv.updateDonor(donor);
    else
      this.donorSrv.addDonor(donor);

    this.selectedIdChange.emit(-1);
  }

  ngOnChanges(c: SimpleChanges){
    if(c['selectedId']){
      if(this.selectedId > 0){
        this.donorSrv.getDonorById(this.selectedId).subscribe(donor => {
          if(donor){
            this.frmDonor.setValue({
              donor_tz: donor.donor_tz,
              donor_name: donor.donor_name,
              email: donor.email,
              phone: donor.phone
            });
          }
        });
      }

      if(this.selectedId == 0){
        this.frmDonor.setValue({
          donor_tz: '',
          donor_name: '',
          email: '',
          phone: ''
        });
      }
    }
  }

  cancel(){
    if(this.selectedId > 0){
      this.donorSrv.getDonorById(this.selectedId).subscribe(donor => {
        if(donor){
          this.frmDonor.setValue({
            donor_tz: donor.donor_tz,
            donor_name: donor.donor_name,
            email: donor.email,
            phone: donor.phone
          });
        }
      });
    }
  }
}
