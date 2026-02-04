import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ShoppingModel } from '../models/shopping/shopping-model';
import { ShoppingCreateModel } from '../models/shopping/ShoppingCreate -model';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class ShoppingService {
  
  BASE_URL: string = 'https://localhost:7164/api/Shopping';
  httpClient: HttpClient = inject(HttpClient);
  authService: AuthService = inject(AuthService);
  
  getAllShoppings() {
      return this.httpClient.get<ShoppingModel[]>(this.BASE_URL, { headers: this.authService.getAuthHeaders() });
  } 

  addShopping(s:ShoppingCreateModel){
      return this.httpClient.post<ShoppingCreateModel>(this.BASE_URL, s, { headers: this.authService.getAuthHeaders(), responseType: 'text' as 'json' });
  }

  updateShopping(s: ShoppingModel){
      return this.httpClient.put<ShoppingModel>(`${this.BASE_URL}/${s.id}`, s, { headers: this.authService.getAuthHeaders() });
  }

  getShoppingById(shoppingId: number){
      return this.httpClient.get<ShoppingCreateModel>(this.BASE_URL + '/'+ shoppingId, { headers: this.authService.getAuthHeaders() });
  }

  removeShopping(shoppingId: number){
      return this.httpClient.delete<void>(`${this.BASE_URL}/${shoppingId}`, { headers: this.authService.getAuthHeaders() });
  }

  // פונקציה לאישור רכישה - מעבר מטיוטא לרכישה מאושרת
  confirmShopping(shoppingId: number) {
      return this.httpClient.post(`${this.BASE_URL}/${shoppingId}/confirm`, {}, { headers: this.authService.getAuthHeaders() });
  }
}
