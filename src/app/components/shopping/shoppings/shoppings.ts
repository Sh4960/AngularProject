import { Component, inject } from '@angular/core';
import { ShoppingService } from '../../../services/shopping-service';
import { ShoppingModel } from '../../../models/shopping/shopping-model';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { Observable, of, catchError, map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shoppings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shoppings.html',
  styleUrl: './shoppings.scss'
})
export class Shoppings {
  
  // זריקת שירותים
  shoppingSrv: ShoppingService = inject(ShoppingService);
  authSrv: AuthService = inject(AuthService);
  router = inject(Router);
  
  // רשימת קניות
  shoppings$: Observable<ShoppingModel[]> = this.loadShoppings();
  errorMsg: string = ''; // הודעת שגיאה
  
  // טעינת רשימת קניות
  loadShoppings(): Observable<ShoppingModel[]> {
    return this.shoppingSrv.getAllShoppings().pipe(
      map((shoppings: ShoppingModel[]) => {
        // אם מנהל - הצג הכל, אם לא - רק של המשתמש
        if (this.authSrv.isManager()) {
          return shoppings;
        } else {
          const currentUserId = this.authSrv.getUserIdFromToken();
          return shoppings.filter(shopping => shopping.userId === currentUserId);
        }
      }),
      catchError(err => {
        this.errorMsg = err.error || 'Error loading purchases';
        return of([]);
      })
    );
  }

  
  // אישור קנייה
  confirmShopping(shoppingId: number) {
    this.errorMsg = '';
    this.shoppingSrv.confirmShopping(shoppingId).subscribe({
      next: () => {
        this.shoppings$ = this.loadShoppings();
      },
      error: (err) => {
        // הצגת השגיאה המדויקת מהשרת
        this.errorMsg = err.error || 'Error confirming purchase';
      }
    });
  }
  
  // מחיקת קנייה
  removeShopping(shoppingId: number) {
    this.errorMsg = '';
    this.shoppingSrv.removeShopping(shoppingId).subscribe({
      next: () => {
        this.shoppings$ = this.loadShoppings();
      },
      error: (err) => {
        // הצגת השגיאה המדויקת מהשרת
        this.errorMsg = err.error || 'Error deleting purchase';
      }
    });
  }
}