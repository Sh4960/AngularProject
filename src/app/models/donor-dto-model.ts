import { GiftDTO } from './gift-dto-model';

export interface DonorDTO {
    id: number;
    name: string;
    email: string;
    phone: string;
    gifts: GiftDTO[];
}
