export class GiftModel {
    id: number = 0;
    name: string = '';
    category: string = '';
    cardPrice: number = 10;
    donorId: number = 0;
    donorName: string = '';
    isRaffled: boolean = false; // Added field with default value
}