import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GiftService } from '../../../services/gift-service';
import { GiftModel } from '../../../models/gift-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gift',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './gift.html',
  styleUrls: ['./gift.scss'],
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
    isRaffled: new FormControl(false),
  });

  serverError: string | null = null;
  currentGift: GiftModel | null = null; // שמירת המתנה הנוכחית עם הרכישות

  saveGift() {
    this.serverError = null;
    if (this.frmGift.invalid) {
      this.serverError = 'Please fill in all required fields';
      return;
    }

    // יצירת אובייקט מתנה לשליחה לשרת
    const giftDTO: any = {
      id: this.frmGift.value.id,
      name: this.frmGift.value.name,
      donorName: this.frmGift.value.donorName,
      cardPrice: this.frmGift.value.cardPrice,
      category: this.frmGift.value.category || '',
      donorId: this.frmGift.value.donorId,
      isRaffled: this.frmGift.value.isRaffled
    };

    const obs = this.selectedId > 0
      ? this.giftSrv.updateGift(giftDTO)
      : this.giftSrv.addGift(giftDTO);

    obs.subscribe({
      next: () => this.selectedIdChange.emit(-1),
      error: (err) => this.serverError = err.error || err.message || 'שגיאה בשמירת מתנה'
    });
  }

  // מעדכן טופס כשיד מתנה משתנה
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedId']) {
      if (this.selectedId > 0) {
        // עריכת מתנה קיימת
        this.giftSrv.getGiftById(this.selectedId).subscribe((gift) => {
          this.currentGift = gift; // שמירת המתנה עם הרכישות
          this.frmGift.patchValue(gift);
        });
      } else if (this.selectedId === 0) {
        // מתנה חדשה
        this.currentGift = null;
        this.frmGift.reset();
      } else {
        // ביטול עריכה
        this.currentGift = null;
      }
    }
  }

  // ביטול עריכה
  cancel() {
    this.selectedIdChange.emit(-1);
  }
}
