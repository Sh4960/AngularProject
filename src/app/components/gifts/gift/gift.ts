import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GiftService } from '../../../services/gift-service';
import { GiftModel } from '../../../models/gift-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gift',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './gift.html',
  styleUrl: './gift.scss',
})
export class Gift {
  giftSrv: GiftService = inject(GiftService);

  @Input()
  selectedId: number = -1;

  @Output()
  selectedIdChange: EventEmitter<number> = new EventEmitter<number>();

  frmGift: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    donorName: new FormControl('', [Validators.required]),
    cardPrice: new FormControl(10, [Validators.required]),
    category: new FormControl(''),
    donorId: new FormControl(null, Validators.required),
    isRaffled: new FormControl(false), // Added field with default value
  });

  serverError: string | null = null; // משתנה חדש לשמירת הודעת השגיאה
  // saveGift() {
  //   let gift: GiftModel = this.frmGift.value;
  //   if (this.selectedId > 0) {
  //     this.giftSrv.updateGift(gift).subscribe(() => {
  //       this.selectedIdChange.emit(-1);
  //     });
  //   } else {
  //     this.giftSrv.addGift(gift).subscribe(() => {
  //       this.selectedIdChange.emit(-1);
  //     });
  //   }
  // }
// saveGift() {
//   if (this.frmGift.invalid) {
//     console.error('Form is invalid', this.frmGift.errors);
//     return;
//   }

//   // Prepare DTO matching exactly GiftDTO expected by backend
//   let giftDTO = {
//     id: this.frmGift.value.id,
//     name: this.frmGift.value.name?.trim() || '',
//     category: this.frmGift.value.category?.trim() || '',
//     cardPrice: this.frmGift.value.cardPrice,
//     donorId: this.frmGift.value.donorId,
//     donorName: this.frmGift.value.donorName?.trim() || '',
//     isRaffled: this.frmGift.value.isRaffled
//   };

//   if (this.selectedId > 0) {
//     this.giftSrv.updateGift(giftDTO).subscribe({
//       next: () => this.selectedIdChange.emit(-1),
//       error: err => console.error('Update failed', err)
//     });
//   } else {
//     this.giftSrv.addGift(giftDTO).subscribe({
//       next: () => this.selectedIdChange.emit(-1),
//       error: err => console.error('Add failed', err)
//     });
//   }
// }

saveGift() {
  this.serverError = null;
  if (this.frmGift.invalid) {
    // console.error('Form is invalid', this.frmGift.errors);
    this.serverError = 'Form is invalid'
    return;
  }

  let giftDTO = {
    id: this.frmGift.value.id,
    name: this.frmGift.value.name?.trim() || '',
    category: this.frmGift.value.category?.trim() || '',
    cardPrice: this.frmGift.value.cardPrice,
    donorId: this.frmGift.value.donorId,
    donorName: this.frmGift.value.donorName?.trim() || '',
    isRaffled: this.frmGift.value.isRaffled
  };

  if (this.selectedId > 0) {
    this.giftSrv.updateGift(giftDTO).subscribe({
      next: () => this.selectedIdChange.emit(-1),
      error: err => {
        if (err.status === 400 && err.error?.Errors) {
          // console.error('Validation errors:', err.error.Errors);
          this.serverError = Object.values(err.error.Errors).join(', ');
        } else {
          // console.error('Update failed', err);
          this.serverError = 'Update failed'
        }
      }
    });
  } else {
    this.giftSrv.addGift(giftDTO).subscribe({
      next: () => this.selectedIdChange.emit(-1),
      error: err => {
        if (err.status === 400 && err.error?.Errors) {
          // console.error('Validation errors:', err.error.Errors);
          this.serverError = Object.values(err.error.Errors).join(', ')
        } else {
          // console.error('Add failed', err);
          this.serverError = 'Add failed'
        }
      }
    });
  }
}


  ngOnChanges(c: SimpleChanges) {
    if (c['selectedId']) {
      this.serverError = null;
      if (this.selectedId > 0) {
        this.giftSrv.getGiftById(this.selectedId).subscribe((gift) => {
          if (gift) {
            this.frmGift.setValue(gift);
          }
        });
      }

      if (this.selectedId === 0) {
        this.frmGift.reset({
          id: 0,
          name: '',
          donorName: '',
          cardPrice: 10,
          category: '',
          donorId: 0,
          isRaffled: false, // Reset default value
        });
      }
    }
  }

  cancel() {
    this.serverError = null;
    if (this.selectedId > 0) {
      this.giftSrv.getGiftById(this.selectedId).subscribe((gift) => {
        if (gift) {
          this.frmGift.setValue(gift);
        }
      });
    }
  }
}




