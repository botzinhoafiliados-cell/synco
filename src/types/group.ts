export type GroupStatus = 'active' | 'inactive' | 'paused';
export type ChannelType = 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'email';

export interface Channel {
    id: string;
    user_id: string;
    name: string;
    type: ChannelType;
    status: GroupStatus;
    description?: string;
    config?: any;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    // UI fields (computed or joined)
    groups_count?: number;
    contacts_count?: number;
    messages_sent?: number;
}

export interface Group {
    id: string;
    user_id: string;
    channel_id: string;
    marketplace_id?: string | null;
    name: string;
    description?: string;
    status: GroupStatus;
    is_source: boolean;
    is_destination: boolean;
    is_monitored: boolean;
    members_count: number;
    tags: string[];
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    // UI fields (joined)
    channel_name?: string;
    sends_received?: number;
}
