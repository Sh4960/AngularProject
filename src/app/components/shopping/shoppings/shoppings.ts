import { Component, inject } from '@angular/core';
import { ShoppingService } from '../../../services/shopping-service';
import { GiftService } from '../../../services/gift-service';
import { ShoppingSortDTO, ShoppingSortBy } from '../../../models/shopping-sort.model';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shoppings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  isPaymentProcessing: boolean = false;

  // מצב התצוגה: 'cart' = סל קניות, 'orders' = ההזמנות שלי, 'admin' = ניהול רכישות
  viewMode: 'cart' | 'orders' | 'admin' = 'cart';

  // מיון
  sort: ShoppingSortDTO = {
    sortBy: undefined,
    desc: true
  };

  // Enum for template access
  ShoppingSortBy = ShoppingSortBy;

  ngOnInit() {
    // בחירת מצב ברירת מחדל: מנהל יראה ניהול, לקוח יראה סל
    this.viewMode = this.authSrv.isManager() ? 'admin' : 'cart';
    this.refreshShoppings();
  }
  
  // טעינת רכישות מהשרת
  refreshShoppings() {
    this.errorMsg = '';
    const userId = this.authSrv.getUserIdFromToken();
    
    // טען כל הרכישות מהשרת
    this.shoppingSrv.getAllShoppings().subscribe({
      next: (allShoppings: any[]) => {
        
        // סנן לפי מצב התצוגה
        let filteredShoppings: any[] = [];
        
        if (this.viewMode === 'cart') {
          // סל קניות: רק טיוטות של המשתמש הנוכחי  
          filteredShoppings = allShoppings.filter((s: any) => {
            const isUserMatch = s.userId === userId;
            const isDraft = s.isDraft !== false; // כל מה שלא false במפורש זה טיוטה
            return isUserMatch && isDraft;
          });
        } else if (this.viewMode === 'orders') {
          // ההזמנות שלי: רק רכישות מאושרות של המשתמש הנוכחי
          filteredShoppings = allShoppings.filter((s: any) => {
            return s.userId === userId && s.isDraft === false;
          });
        } else if (this.viewMode === 'admin') {
          // ניהול רכישות: רק רכישות מאושרות של כל המשתמשים (למנהל בלבד)
          filteredShoppings = allShoppings.filter((s: any) => {
            return s.isDraft === false;
          });
        }
        
        // טען מתנות לקבל שמות ומחירים
        this.giftSrv.getAllGifts().subscribe({
          next: (gifts) => {
            // שלב שמות המתנות עם הרכישות
            const shoppingWithGifts = filteredShoppings.map((shopping: any) => {
              const gift = gifts.find((g: any) => g.id === shopping.giftId);
              return {
                ...shopping,
                giftName: gift?.name || 'Unknown Gift',
                cardPrice: gift?.cardPrice || 0
              };
            });
            
            // קבץ רכישות לפי giftId
            const consolidated = this.getConsolidatedShoppings(shoppingWithGifts);
            const sorted = this.applySortToArray(consolidated);
            this.shoppings$ = of(sorted);
          },
          error: () => {
            // קבץ רכישות לפי giftId
            const consolidated = this.getConsolidatedShoppings(filteredShoppings.map((s: any) => ({
              ...s,
              giftName: 'Unknown Gift',
              cardPrice: 0
            })));
            const sorted = this.applySortToArray(consolidated);
            this.shoppings$ = of(sorted);
          }
        });
      },
      error: () => {
        this.errorMsg = 'Error loading orders';
        this.shoppings$ = of([]);
      }
    });
  }

  // הוספת כמות (רק בסל קניות)
  increaseQuantity(shopping: any) {
    if (this.viewMode !== 'cart') {
      this.errorMsg = 'Quantity can only be changed in shopping cart';
      return;
    }
    
    const originalQuantity = shopping.quantity;
    const shoppingId = shopping.firstId || shopping.id; // שתמש בfirstId אם קיים (consolidated)
    
    shopping.quantity++;
    
    // עדכן עם ה-ID הנכון
    const updateObj = { ...shopping, id: shoppingId };
    
    this.shoppingSrv.updateShopping(updateObj).subscribe({
      next: () => {
        this.refreshShoppings();
      },
      error: (err) => {
        shopping.quantity = originalQuantity; // חזור לערך המקורי אם שגיאה
        this.errorMsg = 'Error updating quantity: ' + err.error;
      }
    });
  }

  // הפחתת כמות (רק בסל קניות)
  decreaseQuantity(shopping: any) {
    if (this.viewMode !== 'cart') {
      this.errorMsg = 'Quantity can only be changed in shopping cart';
      return;
    }
    
    if (shopping.quantity > 1) {
      const originalQuantity = shopping.quantity;
      const shoppingId = shopping.firstId || shopping.id; // שתמש בfirstId אם קיים (consolidated)
      
      shopping.quantity--;
      
      // עדכן עם ה-ID הנכון
      const updateObj = { ...shopping, id: shoppingId };
      
      this.shoppingSrv.updateShopping(updateObj).subscribe({
        next: () => {
          this.refreshShoppings();
        },
        error: (err) => {
          shopping.quantity = originalQuantity; // Return to original value if error
          this.errorMsg = 'Error updating quantity: ' + err.error;
        }
      });
    }
  }
  
  // מחיקת רכישה (רק בסל קניות)
  removeShopping(shopping: any) {
    // בדקי שאנחנו במצב סל קניות
    if (this.viewMode !== 'cart') {
      this.errorMsg = 'Items can only be deleted from shopping cart';
      return;
    }
    
    const shoppingId = shopping.firstId || shopping.id; // שתמש בfirstId אם קיים (consolidated)
    
    this.shoppingSrv.removeShopping(shoppingId).subscribe({
      next: () => {
        this.refreshShoppings();
      },
      error: (err) => {
        this.errorMsg = 'Error deleting item: ' + err.error;
      }
    });
  }

  // בצע תשלום לכל הפריטים בסל הקניות
  paymentAll(shoppings: any[]) {
    // בדקי שאנחנו במצב סל קניות
    if (this.viewMode !== 'cart') {
      this.errorMsg = 'Payment can only be made from shopping cart';
      return;
    }
    
    if (!shoppings || shoppings.length === 0) {
      this.errorMsg = 'No items to pay for';
      return;
    }

    this.isPaymentProcessing = true;
    this.errorMsg = '';
    
    // אסוף את כל ה-IDs מכל הקבוצות
    const allShoppingIds: number[] = [];
    shoppings.forEach((shopping: any) => {
      if (shopping.allIds && shopping.allIds.length > 0) {
        allShoppingIds.push(...shopping.allIds);
      } else {
        allShoppingIds.push(shopping.firstId || shopping.id);
      }
    });
    
    // מונים לעקיבה אחרי תוצאות
    let successCount = 0;
    const totalCount = allShoppingIds.length;

    // אשר כל רכישה
    allShoppingIds.forEach((shoppingId: number) => {
      this.shoppingSrv.confirmShopping(shoppingId).subscribe({
        next: () => {
          successCount++;
          
          // אם כל הרכישות אושרו, הצג הודעת הצלחה
          if (successCount === totalCount) {
            this.errorMsg = 'Payment completed successfully! Items moved to your orders';
            this.isPaymentProcessing = false;
            this.refreshShoppings();
          }
        },
        error: () => {
          // If error, display message
          this.errorMsg = 'Error processing payment';
          this.isPaymentProcessing = false;
        }
      });
    });
  }

  // חישוב המחיר הכולל
  getTotalPrice(shoppings: any[]): number {
    return shoppings.reduce((total, s) => total + (s.cardPrice * s.quantity), 0);
  }

  // קבל רכישות מקובצות לפי giftId
  getConsolidatedShoppings(shoppings: any[]): any[] {
    const consolidated: { [key: number]: any } = {};
    
    shoppings.forEach((s: any) => {
      const giftId = s.giftId;
      
      if (consolidated[giftId]) {
        // אם כבר יש - הוסף לכמות
        consolidated[giftId].quantity += s.quantity;
        // הוסף את ה-ID לרשימה
        consolidated[giftId].allIds.push(s.id);
      } else {
        // אם לא יש - הוסף חדש
        consolidated[giftId] = {
          ...s,
          firstId: s.id,
          allIds: [s.id]  // שמור את כל ה-IDs
        };
      }
    });
    
    return Object.values(consolidated);
  }

  // קבל רק טיוטות
  getDraftsOnly(shoppings: any[]): any[] {
    return shoppings.filter((s: any) => s.isDraft !== false);
  }

  // החלפת מצב תצוגה
  switchViewMode(mode: 'cart' | 'orders' | 'admin') {
    this.viewMode = mode;
    this.refreshShoppings();
  }

  // Apply sorting to array based on sort settings
  applySortToArray(shoppings: any[]): any[] {
    if (!this.sort.sortBy) {
      return shoppings;
    }

    const sortedArray = [...shoppings];
    
    sortedArray.sort((a, b) => {
      let compareValue = 0;
      
      if (this.sort.sortBy === ShoppingSortBy.Price) {
        // Sort by total price (cardPrice * quantity)
        const totalA = a.cardPrice * a.quantity;
        const totalB = b.cardPrice * b.quantity;
        compareValue = totalA - totalB;
      } else if (this.sort.sortBy === ShoppingSortBy.Popularity) {
        // Sort by quantity
        compareValue = a.quantity - b.quantity;
      }
      
      // Apply descending if needed
      return this.sort.desc ? -compareValue : compareValue;
    });
    
    return sortedArray;
  }

  // בדיקה אם המשתמש הוא מנהל
  isManager(): boolean {
    return this.authSrv.isManager();
  }

  // קבלת כותרת המסך לפי המצב
  getScreenTitle(): string {
    switch (this.viewMode) {
      case 'cart': return 'My Shopping Cart';
      case 'orders': return 'My Orders';
      case 'admin': return 'Orders Management';
      default: return 'Shopping';
    }
  }

  // החלת מיון
  applySort() {
    this.refreshShoppings();
  }

  // נקה מיון
  clearSort() {
    this.sort = { sortBy: undefined, desc: true };
    this.refreshShoppings();
  }

  // ניווט לעמוד המתנות
  goToGifts() {
    this.router.navigate(['/gifts']);
  }
 
}