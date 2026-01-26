import { Component, inject, OnInit } from '@angular/core';
import { GiftService } from '../../../services/gift-service';
import { GiftModel } from '../../../models/gift-model';
import { Gift } from '../gift/gift';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gifts-list',
  standalone: true,
  imports: [Gift, CommonModule],
  templateUrl: './gifts-list.html',
  styleUrls: ['./gifts-list.scss'],
})
export class GiftsList implements OnInit {
  giftsArr: GiftModel[] = [];
  giftSrv: GiftService = inject(GiftService);
  id: number = -1;

  ngOnInit() {
    this.loadGifts(); // קריאה ראשונית
  }

  onGiftSaved(newId: number) {
    this.id = newId; 
    this.loadGifts(); // מרענן את הרשימה מהשרת
  }

  loadGifts() {
    this.giftSrv.getAllGifts().subscribe({
      next: (gifts) => this.giftsArr = gifts,
      error: err => {
        console.error('Load gifts error', err);
        let msg = 'Failed to load gifts';
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

        alert(msg);
      }
    });
  }

  removeGift(giftID: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק?')) {
      this.giftSrv.removeGift(giftID).subscribe({
        next: () => this.loadGifts(),
        error: err => {
          console.error('Remove gift error', err);
          let msg = 'Failed to remove gift';
          if (!err) msg = 'Unknown error';
          else if (err.status === 0) msg = 'Network error: cannot reach server';
          else if (err.status === 401 || err.status === 403) msg = 'Not authorized';
          else if (err?.error) {
            if (typeof err.error === 'string') msg = err.error;
            else if (err.error.message) msg = String(err.error.message);
            else if (err.error.Message) msg = String(err.error.Message);
            else { try { msg = JSON.stringify(err.error); } catch { msg = String(err.error); } }
          } else msg = err.message ?? msg;

          alert(msg);
        }
      });
    }
  }

  updateGift(giftID: number) {
    this.id = giftID;
  }

  trackById(index: number, gift: GiftModel): number {
    return gift.id;
  }
}
