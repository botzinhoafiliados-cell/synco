export type AutomationFrequency = 'every_30min' | 'hourly' | 'every_2h' | 'every_4h' | 'daily';

export interface Automation {
    name: string;
    saved_filter_name: string;
    min_score: number;
    max_products: number;
    frequency: AutomationFrequency;
    segment_name: string;
    template_name: string;
    status: 'active' | 'paused';
    no_repeat_hours: number;
    total_runs: number;
    total_products_sent: number;
    last_run: string | null;
}
