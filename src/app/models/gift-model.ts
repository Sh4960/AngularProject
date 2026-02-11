import { ShoppingModel } from './shopping/shopping-model';

export class GiftModel {
    id: number = 0;
    name: string = '';
    category: string = '';
    cardPrice: number = 10;
    donorId: number = 0;
    donorName: string = '';
    isRaffled: boolean = false;
    imageUrl: string = ''; // כתובת URL לתמונת המתנה
    shoppings: ShoppingModel[] = []; // רשימת הרכישות של המתנה
}