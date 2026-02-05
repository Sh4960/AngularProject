import { Component, inject } from '@angular/core';
import { GiftService } from '../../../services/gift-service';
import { GiftModel } from '../../../models/gift-model';
import { Gift } from '../gift/gift';
import { CommonModule } from '@angular/common';
import { ShoppingService } from '../../../services/shopping-service';
import { ShoppingCreateModel } from '../../../models/shopping/ShoppingCreate-model';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gifts-list',
  standalone: true,
  imports: [Gift, CommonModule],
  templateUrl: './gifts-list.html',
  styleUrls: ['./gifts-list.scss'],
})
export class GiftsList {
  giftSrv = inject(GiftService);
  shoppingSrv = inject(ShoppingService);
  authSrv = inject(AuthService);
  router = inject(Router);

  gifts$ = this.giftSrv.getAllGifts();
  id: number = -1;
  errorMsg: string = '';

  // טעינת מתנות מהשרת
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

    this.errorMsg = '';
    const userId = this.authSrv.getUserIdFromToken();
    console.log('🛒 Adding to cart - userId:', userId, 'giftId:', giftId);

    // קבל את כל הרכישות כדי לבדוק אם כבר קיימת
    this.shoppingSrv.getAllShoppings().subscribe({
      next: (allShoppings: any[]) => {
        console.log('📦 All shoppings received:', allShoppings);
        
        // חפש רכישה קיימת של אותה מתנה וגם טיוטה
        const existingDraft = allShoppings.find((s: any) => {
          const isDraftValue = s.isDraft !== undefined ? s.isDraft : true;
          return s.userId === userId && s.giftId === giftId && isDraftValue === true;
        });

        console.log('🔍 Existing draft found:', existingDraft);

        if (existingDraft) {
          // אם קיימת - עדכן את הכמות
          existingDraft.quantity++;
          console.log('📝 Updating existing shopping:', existingDraft);
          
          this.shoppingSrv.updateShopping(existingDraft).subscribe({
            next: () => {
              console.log('✅ Shopping updated successfully');
              setTimeout(() => this.router.navigate(['/shoppings']), 500);
            },
            error: (err) => {
              console.error('❌ Error updating shopping:', err);
              this.errorMsg = 'שגיאה בעדכון הרכישה: ' + err.error;
            }
          });
        } else {
          // אם לא קיימת טיוטה - צור חדשה
          const dataToSend: ShoppingCreateModel = {
            userId: userId,
            giftId: giftId,
            quantity: 1
          };
          
          console.log('✨ Creating new shopping:', dataToSend);
          
          this.shoppingSrv.addShopping(dataToSend).subscribe({
            next: (response) => {
              console.log('✅ Shopping created successfully:', response);
              setTimeout(() => this.router.navigate(['/shoppings']), 500);
            },
            error: (err) => {
              console.error('❌ Error adding shopping:', err);
              this.handleAddToCartError(err);
            }
          });
        }
      },
      error: (err) => {
        console.error('❌ Error fetching shoppings:', err);
        this.errorMsg = 'שגיאה בטעינת הרכישות: ' + err.error;
      }
    });
  }

  // פונקציה עזר לטיפול בשגיאות
  private handleAddToCartError(err: any) {
    console.error('Add to cart error:', err.error);
    let errorMessage = 'שגיאה בהוספה לסל';
    
    if (typeof err.error === 'string') {
      errorMessage = err.error;
    } else if (err.error?.errors && Array.isArray(err.error.errors)) {
      const errorsArray = err.error.errors;
      const errorMessages = errorsArray.map((e: any) => {
        if (typeof e === 'object' && e.message) {
          return e.message;
        }
        return typeof e === 'string' ? e : JSON.stringify(e);
      });
      errorMessage = errorMessages.join(' | ');
    } else if (err.error?.title) {
      errorMessage = err.error.title;
    } else if (err.error?.message) {
      errorMessage = err.error.message;
    }
    
    this.errorMsg = errorMessage;
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
