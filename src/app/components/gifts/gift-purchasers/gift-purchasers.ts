import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GiftService } from '../../../services/gift-service';
import { ShoppingModel } from '../../../models/shopping/shopping-model';

@Component({
  selector: 'app-gift-purchasers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gift-purchasers.html',
  styleUrls: ['./gift-purchasers.scss']
})
export class GiftPurchasers implements OnInit {
  giftSrv = inject(GiftService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  giftId: number = 0;
  giftName: string = '';
  cardPrice: number = 0;
  purchasers: any[] = [];
  loading: boolean = true;
  errorMsg: string = '';
  totalQuantity: number = 0;
  totalIncome: number = 0;

  ngOnInit() {
    this.giftId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.giftId > 0) {
      this.loadGiftPurchasers();
    } else {
      this.errorMsg = 'מזהה מתנה לא תקין';
      this.loading = false;
    }
  }

  loadGiftPurchasers() {
    this.loading = true;
    this.errorMsg = '';

    this.giftSrv.getGiftById(this.giftId).subscribe({
      next: (gift) => {
        this.giftName = gift.name;
        this.cardPrice = gift.cardPrice;
        
        // סינון רק רכישות ששולמו (לא טיוטות)
        const paidPurchases = gift.shoppings.filter(s => !s.isDraft);
        
        // קיבוץ רכישות לפי משתמש וסיכום כמויות
        const groupedMap = new Map<number, any>();
        
        paidPurchases.forEach(shopping => {
          if (groupedMap.has(shopping.userId)) {
            // משתמש קיים - הוסף כמות
            groupedMap.get(shopping.userId).quantity += shopping.quantity;
          } else {
            // משתמש חדש - הוסף למפה
            groupedMap.set(shopping.userId, {
              id: shopping.id,
              userId: shopping.userId,
              userName: shopping.userName,
              email: shopping.email,
              phone: shopping.phone,
              quantity: shopping.quantity
            });
          }
        });
        
        // המרת המפה למערך
        this.purchasers = Array.from(groupedMap.values());
        
        // חישוב סיכומים
        this.totalQuantity = this.purchasers.reduce((sum, p) => sum + p.quantity, 0);
        this.totalIncome = this.totalQuantity * this.cardPrice;
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading gift purchasers:', err);
        this.errorMsg = 'שגיאה בטעינת נתוני הרוכשים';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/gifts']);
  }
}
