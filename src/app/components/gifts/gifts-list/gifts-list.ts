import { Component, inject } from '@angular/core';
import { GiftService } from '../../../services/gift-service';
import { GiftModel } from '../../../models/gift-model';
import { Gift } from '../gift/gift';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gifts-list',
  imports: [Gift, CommonModule],
  templateUrl: './gifts-list.html',
  styleUrl: './gifts-list.scss',
})
export class GiftsList {
  giftsArr: GiftModel[] = [];
  giftSrv: GiftService = inject(GiftService);
  id: number = -1;
  
  ngOnInit() {
    this.loadGifts(); // קריאה ראשונית
  }
  
  onGiftSaved(newId: number) {
    this.id = newId; // מעדכן את ה-id לערך שחזר (למשל 1-)
    this.loadGifts(); // מרענן את הרשימה מהשרת
  }

  loadGifts() {
    this.giftSrv.getAllGifts().subscribe((gifts) => {
      this.giftsArr = gifts;
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
