export interface DestinationList {
    id: string;
    name: string;
    description?: string;
    group_ids: string[];
    color: string;
    icon: string;
    status: 'active' | 'inactive';
}
