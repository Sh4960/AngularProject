import { inject, Injectable } from '@angular/core';
import { GiftModel } from '../models/gift-model';
import { HttpClient } from '@angular/common/http';
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

    // הוספת מתנה חדשה
    addGift(g: any){
        return this.httpClient.post(this.BASE_URL, g, { headers: this.authService.getAuthHeaders(), responseType: 'text' });
    }

    // עדכון מתנה קיימת
    updateGift(g: any){
        return this.httpClient.put(`${this.BASE_URL}/${g.id}`, g, { headers: this.authService.getAuthHeaders(), responseType: 'text' });
    }

    // קבלת מתנה לפי קוד
    getGiftById(giftId: number){
        return this.httpClient.get<GiftModel>(this.BASE_URL + '/'+ giftId, { headers: this.authService.getAuthHeaders() });
    }

    removeGift(giftId: number){
        return this.httpClient.delete<void>(`${this.BASE_URL}/${giftId}`, { headers: this.authService.getAuthHeaders() });
    }
}
