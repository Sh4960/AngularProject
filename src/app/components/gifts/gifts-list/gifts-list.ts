import { Component, inject } from '@angular/core';
import { GiftService } from '../../../services/gift-service';
import { GiftModel } from '../../../models/gift-model';
import { GiftFilterDTO, GiftSortBy } from '../../../models/gift-filter.model';
import { RaffleResultDTO } from '../../../models/raffle-result-model';
import { RaffleReportDTO } from '../../../models/raffle-report-model';
import { Gift } from '../gift/gift';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingService } from '../../../services/shopping-service';
import { ShoppingCreateModel } from '../../../models/shopping/ShoppingCreate -model';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gifts-list',
  standalone: true,
  imports: [Gift, CommonModule, FormsModule],
  templateUrl: './gifts-list.html',
  styleUrls: ['./gifts-list.scss'],
})

export class GiftsList {
  giftSrv = inject(GiftService);
  shoppingSrv = inject(ShoppingService);
  authSrv = inject(AuthService);
  router = inject(Router);

   // משתני רכיב
  gifts$: Observable<GiftModel[]> = this.giftSrv.getAllGifts();
  id: number = -1; // קוד מתנה לעריכה
  errorMsg: string = ''; // הודעת שגיאה
  raffleResult: RaffleResultDTO[] = []; // תוצאות הגרלה אחרונות
  
  // מסננים ומיון
  filter: GiftFilterDTO = {
    giftName: '',
    donorName: '',
    category: '',
    sortBy: undefined,
    desc: false
  };

  // Enum for template access
  GiftSortBy = GiftSortBy;
  
  private readonly STORAGE_KEY = 'raffleResults';

  ngOnInit() {
    // טעינת תוצאות הגרלה מ-localStorage
    this.loadRaffleResultsFromStorage();
  }

  // טעינת תוצאות הגרלה מ-localStorage
  private loadRaffleResultsFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.raffleResult = JSON.parse(stored);
           }
    } catch (error) {
      console.error('Error loading raffle results from storage:', error);
    }
  }

  // טעינת מתנות מהשרת
  loadGifts() {
    this.gifts$ = this.giftSrv.getAllGifts();
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

 


  // שמירת תוצאות הגרלה ב-localStorage
  private saveRaffleResultsToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.raffleResult));
    } catch (error) {
      console.error('Error saving raffle results to storage:', error);
    }
  }

  // טעינת רשימת מתנות מהשרת
  

  applyFilters() {
    this.errorMsg = '';
    const filterDTO: GiftFilterDTO = {};
    
    if (this.filter.giftName?.trim()) filterDTO.giftName = this.filter.giftName.trim();
    if (this.filter.donorName?.trim()) filterDTO.donorName = this.filter.donorName.trim();
    if (this.filter.category?.trim()) filterDTO.category = this.filter.category.trim();
    if (this.filter.sortBy) {
      filterDTO.sortBy = this.filter.sortBy;
      filterDTO.desc = this.filter.desc;
    }

    // אם יש לפחות סינון או מיון אחד, השתמש ב-API מסונן
    if (Object.keys(filterDTO).length > 0) {
      this.gifts$ = this.giftSrv.getFilteredGifts(filterDTO);
    } else {
      // אחרת, הצג את כל המתנות
      this.loadGifts();
    }
  }

  clearFilters() {
    this.filter = { 
      giftName: '', 
      donorName: '', 
      category: '', 
      sortBy: undefined, 
      desc: false 
    };
    this.loadGifts();
  }

  // אירוע בשמירת מתנה
  onGiftSaved(newId: number) {
    this.id = newId;
    this.loadGifts();
  }

  // הוספת מתנה לסל קניות


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

  raffleGift(giftId: number) {
    this.giftSrv.raffleGift(giftId).subscribe({
      next: (res: RaffleResultDTO) => {
        alert(`🎉 הזוכה במתנה "${res.giftName}" הוא: ${res.winnerUserName}`);
         this.raffleResult = [
        ...this.raffleResult?.filter(r => r.giftId !== res.giftId) || [],
        res
      ];
        this.saveRaffleResultsToStorage();
        this.loadGifts();
      },
      error: (err) => {
        this.errorMsg = err.error || 'שגיאה בביצוע ההגרלה';
      }
    });
  }
  
  // downloadPdf() {
  //   this.giftSrv.getRaffleWinnersPdf().subscribe({
  //     next: (blob: Blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       window.open(url);
  //     },
  //     error: (err) => {
  //       console.error('PDF Download Error:', err);
  //       if (err.status === 401) {
  //         this.errorMsg = 'אין הרשאה להורדת דוח - יש להתחבר כמנהל';
  //       } else if (err.status === 0) {
  //         this.errorMsg = 'שגיאת תקשורת עם השרת - ודא ש-CORS מוגדר';
  //       } else {
  //         this.errorMsg = `שגיאה בהורדת דוח הזוכים (${err.status})`;
  //       }
  //     }
  //   });
  // }

  downloadPdf() {
  this.giftSrv.getRaffleWinnersPdf()
    // .pipe(takeUntil(this.destroy$))  // ⬅️ 1. Prevent memory leak
    .subscribe({
      next: (blob: Blob) => {
        // 2. Create temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // 3. Create invisible download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `raffle-winners-${new Date().toISOString().split('T')[0]}.pdf`;
        
        // 4. Trigger download
        document.body.appendChild(a);
        a.click();
        
        // 5. Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  // ⬅️ Free memory!
      }
    });
}
  raffleAll() {
    this.giftSrv.raffleAllGifts().subscribe({
      next: (report: RaffleReportDTO) => {
        console.log('Raffle Report:', report);
        if (report && report.results && report.results.length > 0) {
          let message = `בוצעה הגרלה ל־${report.results.length} מתנות\nסך הכנסות: ₪${report.totalIncome}\n\nזוכים:\n`;
          report.results.forEach(result => {
            message += `${result.giftName}: ${result.winnerUserName}\n`;
          });
          alert(message);
          this.raffleResult = report.results;
          this.saveRaffleResultsToStorage();
        } else {
          alert('אין מתנות זמינות להגרלה (כבר הוגרלה או אין קניות)');
        }
        this.loadGifts();
      },
      error: (err) => {
        console.error('Raffle Error:', err);
        this.errorMsg = err.error || 'שגיאה בביצוע ההגרלה לכל המתנות';
        alert(this.errorMsg);
      }
    });
  }
  
  getWinnerName(giftId: number): string | null {
    const found = this.raffleResult.find(r => r.giftId === giftId);
    return found ? found.winnerUserName : null;
  }
  
}
