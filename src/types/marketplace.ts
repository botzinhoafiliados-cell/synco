export interface Marketplace {
    id: string;
    name: string;
    icon: string;
    configured: boolean;
    affiliate_id: string;
    last_validated: string | null;
    color: string;
    description?: string;
}
