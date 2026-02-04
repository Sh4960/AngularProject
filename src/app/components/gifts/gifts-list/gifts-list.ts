import { Component, inject } from '@angular/core';
import { GiftService } from '../../../services/gift-service';
import { GiftModel } from '../../../models/gift-model';
import { Gift } from '../gift/gift';
import { CommonModule } from '@angular/common';
import { ShoppingService } from '../../../services/shopping-service';
import { ShoppingCreateModel } from '../../../models/shopping/ShoppingCreate -model';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gifts-list',
  standalone: true,
  imports: [Gift, CommonModule],
  templateUrl: './gifts-list.html',
  styleUrls: ['./gifts-list.scss'],
})
export class GiftsList {
  // זריקת שירותים
  giftSrv = inject(GiftService);
  shoppingSrv = inject(ShoppingService);
  authSrv = inject(AuthService);
  router = inject(Router);

  // משתני רכיב
  gifts$: Observable<GiftModel[]> = this.giftSrv.getAllGifts();
  id: number = -1; // קוד מתנה לעריכה
  errorMsg: string = ''; // הודעת שגיאה

  // טעינת רשימת מתנות מהשרת
  loadGifts() {
    this.gifts$ = this.giftSrv.getAllGifts();
  }

  // אירוע בשמירת מתנה
  onGiftSaved(newId: number) {
    this.id = newId;
    this.loadGifts();
  }

  // הוספת מתנה לסל קניות
  addToCart(giftId: number) {
    if (!this.authSrv.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // איפוס הודעת שגיאה
    this.errorMsg = '';

    const userId = this.authSrv.getUserIdFromToken();
    const data: ShoppingCreateModel = {
      userId: userId,
      giftId: giftId,
      quantity: 1
    };

    this.shoppingSrv.addShopping(data).subscribe({
      next: () => {
        this.router.navigate(['/shoppings']);
      },
      error: (err) => {
        // הצגת השגיאה המדויקת מהשרת
        if (typeof err.error === 'string') {
          this.errorMsg = err.error;
        } else if (err.error?.title) {
          this.errorMsg = err.error.title;
        } else if (err.error?.message) {
          this.errorMsg = err.error.message;
        } else {
          this.errorMsg = 'Error adding to cart (Status: ' + err.status + ')';
        }
      }
    });
  }

  // הוספת מתנה חדשה
  addGift(gift: GiftModel) {
    this.giftSrv.addGift(gift).subscribe({
      next: () => {
        this.loadGifts();
      },
      error: (err) => {
        this.errorMsg = err.error || 'Error adding gift';
      }
    });
  }

  // מחיקת מתנה
  removeGift(giftID: number) {
    this.giftSrv.removeGift(giftID).subscribe({
      next: () => {
        this.loadGifts();
      },
      error: (err) => {
        this.errorMsg = err.error || 'Error deleting gift';
      }
    });
  }

  // עריכת מתנה - פתיחת טופס עריכה
  updateGift(giftID: number) {
    this.id = giftID;
  }

  // בדיקה אם המשתמש הוא מנהל
  isManager(): boolean {
    return this.authSrv.isManager();
  }
}
