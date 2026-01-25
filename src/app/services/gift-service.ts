import { inject, Injectable } from '@angular/core';
import { GiftModel } from '../models/gift-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GiftService {

    BASE_URL: string = 'https://localhost:7164/api/Gift'; // Corrected endpoint
    httpClient: HttpClient = inject(HttpClient);
    
    getAllGifts() {
        return this.httpClient.get<GiftModel[]>(this.BASE_URL);
    } 

    addGift(g:GiftModel){
            return this.httpClient.post<GiftModel>(this.BASE_URL, g);
        }

    updateGift(g: GiftModel){
        return this.httpClient.put<GiftModel>(`${this.BASE_URL}/${g.id}`, g);
    }

    getGiftById(giftId: number){
        return this.httpClient.get<GiftModel>(this.BASE_URL + '/'+ giftId);
    }

    removeGift(giftId: number){
        return this.httpClient.delete<void>(`${this.BASE_URL}/${giftId}`);
    }
}
