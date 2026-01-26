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

  saveGift() {
    this.serverError = null;
    if (this.frmGift.invalid) {
      this.serverError = 'Form is invalid';
      return;
    }

    const giftDTO: GiftModel = this.frmGift.value;

    const obs = this.selectedId > 0
      ? this.giftSrv.updateGift(giftDTO)
      : this.giftSrv.addGift(giftDTO);

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedId']) {
      this.serverError = null;
      if (this.selectedId > 0) {
        this.giftSrv.getGiftById(this.selectedId).subscribe((gift) => {
          if (gift) this.frmGift.setValue(gift);
        });
      } else if (this.selectedId === 0) {
        this.frmGift.reset({
          id: 0,
          name: '',
          donorName: '',
          cardPrice: 10,
          category: '',
          donorId: 0,
          isRaffled: false,
        });
      }
    }
  }

  cancel() {
    this.serverError = null;
    if (this.selectedId > 0) {
      this.giftSrv.getGiftById(this.selectedId).subscribe((gift) => {
        if (gift) this.frmGift.setValue(gift);
      });
    }
  }
}
