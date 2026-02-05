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

  // מיון
  sort: ShoppingSortDTO = {
    sortBy: undefined,
    desc: true
  };

  // Enum for template access
  ShoppingSortBy = ShoppingSortBy;

  ngOnInit() {
    this.refreshShoppings();
  }
  
  // טעינת רכישות מהשרת
  refreshShoppings() {
    this.errorMsg = '';
    const userId = this.authSrv.getUserIdFromToken();
    
    // טען כל הרכישות מהשרת (טיוטות וגם אושרו)
    this.shoppingSrv.getAllShoppings().subscribe({
      next: (allShoppings: any[]) => {
        console.log('📥 Raw shoppings from server:', allShoppings);
        // סנן רכישות של המשתמש הנוכחי בלבד
        const userShoppings = allShoppings.filter((s: any) => s.userId === userId);
        console.log('👤 User shoppings:', userShoppings);
        
        // טען מתנות לקבל שמות ומחירים
        this.giftSrv.getAllGifts().subscribe({
          next: (gifts) => {
            // שלב שמות המתנות עם הרכישות
            const shoppingWithGifts = userShoppings.map((shopping: any) => {
              const gift = gifts.find((g: any) => g.id === shopping.giftId);
              return {
                ...shopping,
                giftName: gift?.name || 'Unknown Gift',
                cardPrice: gift?.cardPrice || 0
              };
            });
            
            // קבץ רכישות לפי giftId
            const consolidated = this.getConsolidatedShoppings(shoppingWithGifts);
            console.log('💾 Consolidated shoppings:', consolidated);
            this.shoppings$ = of(consolidated);
          },
          error: () => {
            // קבץ רכישות לפי giftId
            const consolidated = this.getConsolidatedShoppings(userShoppings.map((s: any) => ({
              ...s,
              giftName: 'Unknown Gift',
              cardPrice: 0
            })));
            this.shoppings$ = of(consolidated);
          }
        });
      },
      error: () => {
        this.errorMsg = 'שגיאה בטעינת הרכישות';
        this.shoppings$ = of([]);
      }
    });
  }

  // הוספת כמות
  increaseQuantity(shopping: any) {
    const originalQuantity = shopping.quantity;
    const shoppingId = shopping.firstId || shopping.id; // שתמש בfirstId אם קיים (consolidated)
    
    shopping.quantity++;
    console.log('➕ Increasing quantity from', originalQuantity, 'to', shopping.quantity, 'id:', shoppingId);
    
    // עדכן עם ה-ID הנכון
    const updateObj = { ...shopping, id: shoppingId };
    
    this.shoppingSrv.updateShopping(updateObj).subscribe({
      next: () => {
        console.log('✅ Server accepted the update');
        this.refreshShoppings();
      },
      error: (err) => {
        console.error('❌ Server rejected update:', err);
        shopping.quantity = originalQuantity; // חזור לערך המקורי אם שגיאה
        this.errorMsg = 'שגיאה בעדכון הכמות: ' + err.error;
      }
    });
  }

  // הפחתת כמות
  decreaseQuantity(shopping: any) {
    if (shopping.quantity > 1) {
      const originalQuantity = shopping.quantity;
      const shoppingId = shopping.firstId || shopping.id; // שתמש בfirstId אם קיים (consolidated)
      
      shopping.quantity--;
      console.log('➖ Decreasing quantity from', originalQuantity, 'to', shopping.quantity, 'id:', shoppingId);
      
      // עדכן עם ה-ID הנכון
      const updateObj = { ...shopping, id: shoppingId };
      
      this.shoppingSrv.updateShopping(updateObj).subscribe({
        next: () => {
          console.log('✅ Server accepted the update');
          this.refreshShoppings();
        },
        error: (err) => {
          console.error('❌ Server rejected update:', err);
          shopping.quantity = originalQuantity; // חזור לערך המקורי אם שגיאה
          this.errorMsg = 'שגיאה בעדכון הכמות: ' + err.error;
        }
      });
    }
  }
  
  // מחיקת רכישה
  removeShopping(shopping: any) {
    console.log('🗑️ Trying to remove shopping:', shopping);
    
    const shoppingId = shopping.firstId || shopping.id; // שתמש בfirstId אם קיים (consolidated)
    
    // בדוק שזה טיוטה בלבד
    if (shopping.isDraft === false) {
      console.log('❌ Cannot delete confirmed shopping');
      this.errorMsg = 'לא ניתן למחוק רכישה שאושרה';
      return;
    }
    
    console.log('✅ Shopping is draft, deleting with id:', shoppingId);
    this.shoppingSrv.removeShopping(shoppingId).subscribe({
      next: () => {
        console.log('✅ Shopping deleted successfully');
        this.refreshShoppings();
      },
      error: (err) => {
        console.error('❌ Error deleting shopping:', err);
        this.errorMsg = 'שגיאה במחיקת הרכישה: ' + err.error;
      }
    });
  }

  // בצע תשלום לכל הטיוטות בלבד
  paymentAll(shoppings: any[]) {
    console.log('💳 Starting payment process with shoppings:', shoppings);
    
    // סנן רק טיוטות
    const draftsOnly = shoppings.filter((s: any) => s.isDraft !== false);
    
    console.log('📝 Drafts found:', draftsOnly);
    
    if (!draftsOnly || draftsOnly.length === 0) {
      console.log('❌ No drafts to confirm');
      this.errorMsg = 'אין טיוטות לאישור';
      return;
    }

    this.isPaymentProcessing = true;
    this.errorMsg = '';
    
    // מונים לעקיבה אחרי תוצאות
    let successCount = 0;
    const totalCount = draftsOnly.length;

    // אשר כל טיוטה
    draftsOnly.forEach((shopping: any) => {
      const shoppingId = shopping.firstId || shopping.id; // שתמש בfirstId אם קיים (consolidated)
      
      this.shoppingSrv.confirmShopping(shoppingId).subscribe({
        next: () => {
          successCount++;
          
          // אם כל הטיוטות אושרו, הצג הודעת הצלחה
          if (successCount === totalCount) {
            this.errorMsg = 'התשלום בוצע בהצלחה!';
            this.isPaymentProcessing = false;
            this.refreshShoppings(); // מיד בלי setTimeout
          }
        },
        error: () => {
          // אם שגיאה, הצג הודעה
          this.errorMsg = 'שגיאה בביצוע התשלום';
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
        // שמור את ה-ID הראשון לעדכון
        if (!consolidated[giftId].firstId) {
          consolidated[giftId].firstId = s.id;
        }
      } else {
        // אם לא יש - הוסף חדש
        consolidated[giftId] = {
          ...s,
          firstId: s.id
        };
      }
    });
    
    return Object.values(consolidated);
  }

  // קבל רק טיוטות
  getDraftsOnly(shoppings: any[]): any[] {
    return shoppings.filter((s: any) => s.isDraft !== false);
  }
 
  processShoppings(shoppings: any[]) {
    let filteredShoppings = shoppings;
    if (!this.authSrv.isManager()) {
      const currentUserId = this.authSrv.getUserIdFromToken();
      filteredShoppings = shoppings.filter(shopping => shopping.userId === currentUserId);
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
  }

  applySort() {
    this.refreshShoppings();
  }

  clearSort() {
    this.sort = { sortBy: undefined, desc: true };
    this.refreshShoppings();
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
  
 

 
}