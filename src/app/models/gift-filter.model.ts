export interface GiftFilterDTO {
    giftName?: string;
    donorName?: string;
    category?: string;
    sortBy?: GiftSortBy;
    desc?: boolean;
}

export enum GiftSortBy {
    Price = 'Price',
    PurchasesCount = 'PurchasesCount'
}
