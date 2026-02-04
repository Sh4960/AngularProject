import { Component, inject } from '@angular/core';
import { ShoppingService } from '../../../services/shopping-service';
import { GiftService } from '../../../services/gift-service';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shoppings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shoppings.html',
  styleUrl: './shoppings.scss'
})
export class Shoppings {
  
  shoppingSrv = inject(ShoppingService);
  giftSrv = inject(GiftService);
  authSrv = inject(AuthService);
  router = inject(Router);
  
  shoppings$: Observable<any[]> = of([]);
  errorMsg: string = '';

  ngOnInit() {
    this.refreshShoppings();
  }
  
  refreshShoppings() {
    this.errorMsg = '';
    
    this.giftSrv.getAllGifts().subscribe({
      next: (gifts) => {
        this.shoppingSrv.getAllShoppings().subscribe({
          next: (shoppings) => {
            const shoppingsWithGifts = shoppings.map(shopping => {
              const gift = gifts.find(g => g.id === shopping.giftId);
              return {
                ...shopping,
                giftName: gift?.name || 'Unknown Gift',
                cardPrice: gift?.cardPrice || 0
              };
            });

            let filteredShoppings = shoppingsWithGifts;
            if (!this.authSrv.isManager()) {
              const currentUserId = this.authSrv.getUserIdFromToken();
              filteredShoppings = shoppingsWithGifts.filter(shopping => shopping.userId === currentUserId);
            }

            // ✅ קיבוץ רכישות של אותה מתנה לפי userId ו-giftId
            const groupedShoppings = filteredShoppings.reduce((acc, shopping) => {
              const key = `${shopping.userId}-${shopping.giftId}`;
              if (acc[key]) {
                acc[key].quantity += shopping.quantity;
                acc[key].totalPrice = acc[key].cardPrice * acc[key].quantity;
                // שמירת כל ה-IDs לצורך מחיקה
                acc[key].allIds = [...(acc[key].allIds || [shopping.id]), shopping.id];
              } else {
                acc[key] = {
                  ...shopping,
                  totalPrice: shopping.cardPrice * shopping.quantity,
                  allIds: [shopping.id] // שמירה של כל ה-IDs
                };
              }
              return acc;
            }, {} as any);

            const groupedArray = Object.values(groupedShoppings);
            this.shoppings$ = of(groupedArray);
          },
          error: (err) => {
            this.errorMsg = err.error || 'Error loading purchases';
            this.shoppings$ = of([]);
          }
        });
      },
      error: (err) => {
        this.errorMsg = err.error || 'Error loading gifts';
        this.shoppings$ = of([]);
      }
    });
  }
  
  confirmShopping(shoppingItem: any) {
    this.errorMsg = '';
    // אישור כל הרכישות של הפריט הזה
    const allIds = shoppingItem.allIds || [shoppingItem.id];
    
    // נעבור על כל ה-IDs ונאשר אותם
    let completedRequests = 0;
    allIds.forEach((id: number) => {
      this.shoppingSrv.confirmShopping(id).subscribe({
        next: () => {
          completedRequests++;
          if (completedRequests === allIds.length) {
            this.refreshShoppings();
          }
        },
        error: (err) => {
          this.errorMsg = err.error || 'Error confirming purchase';
        }
      });
    });
  }
  
  removeShopping(shoppingItem: any) {
    this.errorMsg = '';
    // מחיקת כל הרכישות של הפריט הזה
    const allIds = shoppingItem.allIds || [shoppingItem.id];
    
    // נעבור על כל ה-IDs ונמחק אותם
    let completedRequests = 0;
    allIds.forEach((id: number) => {
      this.shoppingSrv.removeShopping(id).subscribe({
        next: () => {
          completedRequests++;
          if (completedRequests === allIds.length) {
            this.refreshShoppings();
          }
        },
        error: (err) => {
          this.errorMsg = err.error || 'Error deleting purchase';
        }
      });
    });
  }

  getTotalPrice(shoppings: any[]): number {
    return shoppings.reduce((total, shopping) => {
      return total + (shopping.cardPrice * shopping.quantity);
    }, 0);
  }
}