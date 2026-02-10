import { inject, Injectable } from '@angular/core';
import { GiftModel } from '../models/gift-model';

import { GiftDTO } from '../models/gift-dto-model';
import { GiftFilterDTO } from '../models/gift-filter.model';
import { RaffleResultDTO } from '../models/raffle-result-model';
// import { RaffleReportDTO } from '../models/raffle-report-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class GiftService {

    // כתובת בסיס לAPI
    BASE_URL: string = 'https://localhost:7164/api/Gift';
    
    // זריקת שירותים
    httpClient: HttpClient = inject(HttpClient);
    authService: AuthService = inject(AuthService);
    
    // קבלת כל המתנות
    getAllGifts() {
        return this.httpClient.get<GiftModel[]>(this.BASE_URL, { headers: this.authService.getAuthHeaders() });

    }

    // קבלת מתנות מסוננות וממוינות
    getFilteredGifts(filter: GiftFilterDTO) {
        let params = new HttpParams();
        if (filter.giftName) params = params.set('giftName', filter.giftName);
        if (filter.donorName) params = params.set('donorName', filter.donorName);
        if (filter.category) params = params.set('category', filter.category);
        if (filter.sortBy) params = params.set('sortBy', filter.sortBy.toString());
        if (filter.desc !== undefined) params = params.set('desc', filter.desc.toString());
        
        return this.httpClient.get<GiftModel[]>(`${this.BASE_URL}/filter`, { 
            headers: this.authService.getAuthHeaders(),
            params: params
        });
    } 

    // הוספת מתנה חדשה
    addGift(g: GiftDTO){
        return this.httpClient.post(this.BASE_URL, g, { headers: this.authService.getAuthHeaders(), responseType: 'text' });
    }

    // עדכון מתנה קיימת
    updateGift(g: GiftDTO){
        return this.httpClient.put(`${this.BASE_URL}/${g.id}`, g, { headers: this.authService.getAuthHeaders(), responseType: 'text' });
    }

    // קבלת מתנה לפי קוד
    getGiftById(giftId: number){
        return this.httpClient.get<GiftModel>(this.BASE_URL + '/'+ giftId, { headers: this.authService.getAuthHeaders() });
    }

    removeGift(giftId: number){
        return this.httpClient.delete<void>(`${this.BASE_URL}/${giftId}`, { headers: this.authService.getAuthHeaders() });
    }

    raffleGift(giftId: number) {
        return this.httpClient.post<RaffleResultDTO>(`${this.BASE_URL}/${giftId}/raffle`, {}, { headers: this.authService.getAuthHeaders() });
    }
      
    // הורדת PDF של זוכים בהגרלה
    getRaffleWinnersPdf() {
        return this.httpClient.get('https://localhost:7164/api/RafflePdf/winners', {
            headers: this.authService.getAuthHeaders(),
            responseType: 'blob'
        });
    }

    // raffleAllGifts() {
    //     return this.httpClient.post<RaffleReportDTO>(
    //         `${this.BASE_URL}/raffleAll`,
    //         {},
    //         { headers: this.authService.getAuthHeaders() }
    //     );
    // }

  
  
}
