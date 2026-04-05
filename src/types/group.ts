export type GroupStatus = 'active' | 'inactive' | 'paused';
export type ChannelType = 'whatsapp' | 'telegram' | 'instagram' | 'facebook' | 'email';

export interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    status: GroupStatus;
    groups_count: number;
    contacts_count: number;
    messages_sent: number;
    description?: string;
}

export interface Group {
    id: string;
    name: string;
    channel_name: string;
    members_count: number;
    status: GroupStatus;
    tags: string[];
    is_source: boolean;
    is_destination: boolean;
    sends_received: number;
    is_monitored: boolean;
    platform?: string; // Adicionado para compatibilidade com mock
}
