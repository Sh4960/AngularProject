import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ShoppingModel } from '../models/shopping/shopping-model';
import { ShoppingCreateModel } from '../models/shopping/ShoppingCreate-model';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class ShoppingService {
  
  BASE_URL: string = 'https://localhost:7164/api/Shopping';
  httpClient: HttpClient = inject(HttpClient);
  authService: AuthService = inject(AuthService);
  
  // קבלת כל הרכישות
  getAllShoppings() {
    return this.httpClient.get<ShoppingModel[]>(this.BASE_URL, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  // הוספת רכישה חדשה
  addShopping(s: ShoppingCreateModel) {
    return this.httpClient.post(this.BASE_URL, s, { 
      headers: this.authService.getAuthHeaders(), 
      responseType: 'text' 
    });
  }

  // עדכון רכישה
  updateShopping(s: ShoppingModel) {
    console.log('📤 Sending PUT request with shopping:', s);
    return this.httpClient.put(
      `${this.BASE_URL}/${s.id}`, 
      s, 
      { 
        headers: this.authService.getAuthHeaders(),
        responseType: 'text'
      } 
    );
  }

  // קבלת רכישה לפי ID
  getShoppingById(shoppingId: number) {
    return this.httpClient.get<ShoppingCreateModel>(`${this.BASE_URL}/${shoppingId}`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  // מחיקת רכישה
  removeShopping(shoppingId: number) {
    return this.httpClient.delete<void>(`${this.BASE_URL}/${shoppingId}`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  // אישור רכישה
  confirmShopping(shoppingId: number) {
    return this.httpClient.post(`${this.BASE_URL}/${shoppingId}/confirm`, {}, { 
      headers: this.authService.getAuthHeaders(), 
      responseType: 'text' 
    });
  }
}
