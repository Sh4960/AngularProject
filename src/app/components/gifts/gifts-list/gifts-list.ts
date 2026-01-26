import { Component, inject, OnInit } from '@angular/core';
import { GiftService } from '../../../services/gift-service';
import { GiftModel } from '../../../models/gift-model';
import { Gift } from '../gift/gift';
import { CommonModule } from '@angular/common';
import { ShoppingService } from '../../../services/shopping-service';
import { ShoppingCreateModel } from '../../../models/shopping/ShoppingCreate -model';

@Component({
  selector: 'app-gifts-list',
  standalone: true,
  imports: [Gift, CommonModule],
  templateUrl: './gifts-list.html',
  styleUrls: ['./gifts-list.scss'],
})
export class GiftsList {
  giftsArr: GiftModel[] = [];
  giftSrv: GiftService = inject(GiftService);
  shoppingSrv: ShoppingService = inject(ShoppingService);

  id: number = -1;
  userId = 1002; // מזהה משתמש לדוגמה צריך לשנות את זה ולקבל את המשתמש האמיתי מהטוקן
  
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

        console.error('Error message:', msg);
      }
    });
  }

  addToCart(giftId: number) {
    const data: ShoppingCreateModel = {
      userId: this.userId,
      giftId: giftId,
      quantity: 1
    };

    this.shoppingSrv.addShopping(data).subscribe({
      next: () => alert('נוסף לסל'),
      error: err => console.error(err)
    });
  }

  addGift(gift: GiftModel) {
    this.giftSrv.addGift(gift).subscribe(() => {
      this.loadGifts();
    });
  }
  
  removeGift(giftID: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק?')) {
      this.giftSrv.removeGift(giftID).subscribe(() => {
        this.loadGifts();
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
