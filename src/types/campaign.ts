export type CampaignStatus = 'active' | 'completed' | 'scheduled' | 'draft' | 'failed';

export interface Campaign {
    id: string;
    name: string;
    segment_name: string;
    template_name: string;
    status: CampaignStatus;
    products_count: number;
    sent_count: number;
    pending_count: number;
    failed_count: number;
    scheduled_date?: string;
    completed_date?: string;
}
