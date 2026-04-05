export interface Monitoring {
    id: string;
    source_group: string;
    source_channel: string;
    dest_segments: string[];
    template: string;
    min_score: number;
    marketplaces: string[];
    auto_send: boolean;
    require_review: boolean;
    no_repeat_hours: number;
    status: 'active' | 'paused';
    total_intercepted: number;
    total_sent: number;
}
