import { Component, inject } from '@angular/core';
import { DonorService } from '../../../services/donor-service';
import { DonorModel } from '../../../models/donor-model';
import { Donor } from '../donor/donor';

@Component({
  selector: 'app-donors-list',
  imports: [Donor],
  templateUrl: './donors-list.html',
  styleUrl: './donors-list.scss'
})
export class DonorsList {

  donorsArr: DonorModel[] = [];
  donorSrv: DonorService = inject(DonorService);
  id: number = -1;

  ngOnInit(){
    this.donorSrv.getAllDonors().subscribe(donors => {
      this.donorsArr = donors;
    });
  }

  addDonor(donor: DonorModel){
    this.donorSrv.addDonor(donor);
  }
}
