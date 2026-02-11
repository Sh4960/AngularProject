export interface GiftDTO {
    id: number;
    name: string;
    category: string;
    cardPrice: number;
    donorId: number;
    donorName: string;
    isRaffled: boolean;
    imageUrl: string; // כתובת URL לתמונת המתנה
}
