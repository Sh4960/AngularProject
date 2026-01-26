import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { inject } from '@angular/core/primitives/di';
import { ShoppingModel } from '../models/shopping/shopping-model';
import { ShoppingCreateModel } from '../models/shopping/ShoppingCreate -model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingService {
  
  BASE_URL: string = 'https://localhost:7164/api/shopping'; // Corrected endpoint
  httpClient: HttpClient = inject(HttpClient);
  
  getAllShoppings() {
      return this.httpClient.get<ShoppingModel[]>(this.BASE_URL);
  } 

  addShopping(s:ShoppingCreateModel){
          return this.httpClient.post<ShoppingCreateModel>(this.BASE_URL, s, { responseType: 'text' as 'json'}
          );
      }

  updateShopping(s: ShoppingModel){
      return this.httpClient.put<ShoppingModel>(`${this.BASE_URL}/${s.id}`, s);
  }

  getShoppingById(shoppingId: number){
      return this.httpClient.get<ShoppingCreateModel>(this.BASE_URL + '/'+ shoppingId);
  }

  removeShopping(shoppingId: number){
      return this.httpClient.delete<void>(`${this.BASE_URL}/${shoppingId}`);
  }
}
