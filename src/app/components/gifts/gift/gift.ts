import { Component, EventEmitter, inject, Input, Output, SimpleChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GiftService } from '../../../services/gift-service';
import { DonorService } from '../../../services/donor-service';
import { GiftModel } from '../../../models/gift-model';
import { GiftDTO } from '../../../models/gift-dto-model';
import { DonorDTO } from '../../../models/donor-dto-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gift',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './gift.html',
  styleUrls: ['./gift.scss'],
})
export class Gift implements OnInit {
  giftSrv: GiftService = inject(GiftService);
  donorSrv: DonorService = inject(DonorService);

  @Input()
  selectedId: number = -1;

  @Output()
  selectedIdChange: EventEmitter<number> = new EventEmitter<number>();
  
  donors: DonorDTO[] = [];
  
  frmGift: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    donorName: new FormControl('', [Validators.required]),
    cardPrice: new FormControl(10, [Validators.required]),
    category: new FormControl(''),
    donorId: new FormControl('', Validators.required),
    isRaffled: new FormControl(false),
  });

  serverError: string | null = null;
  currentGift: GiftModel | null = null; // שמירת המתנה הנוכחית עם הרכישות

  ngOnInit() {
    this.loadDonors();
  }

  loadDonors() {
    this.donorSrv.getAllDonors().subscribe({
      next: (donors) => this.donors = donors,
      error: (err) => console.error('Error loading donors:', err)
    });
  }

  onDonorChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const donorId = Number(selectElement.value);
    
    if (donorId) {
      const selectedDonor = this.donors.find(d => d.id === donorId);
      if (selectedDonor) {
        this.frmGift.patchValue({
          donorId: selectedDonor.id,
          donorName: selectedDonor.name
        });
      }
    } else {
      this.frmGift.patchValue({
        donorId: '',
        donorName: ''
      });
    }
  }

  saveGift() {
    this.serverError = null;
    if (this.frmGift.invalid) {
      this.serverError = 'Please fill in all required fields';
      return;
    }

    // יצירת אובייקט מתנה לשליחה לשרת

    const giftDTO: GiftDTO = {
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
        // מתנה חדשה - איפוס עם ערכי ברירת מחדל
        this.currentGift = null;
        this.frmGift.patchValue({
          id: 0,
          name: '',
          donorName: '',
          cardPrice: 10,
          category: '',
          donorId: '',
          isRaffled: false
        });
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
