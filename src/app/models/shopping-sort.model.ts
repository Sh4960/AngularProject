export interface ShoppingSortDTO {
    sortBy?: ShoppingSortBy;
    desc?: boolean;
}

export enum ShoppingSortBy {
    Price = 'Price',
    Popularity = 'Popularity'
}
