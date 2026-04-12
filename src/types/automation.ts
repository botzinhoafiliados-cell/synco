// src/types/automation.ts

export interface AutomationFilters {
  min_price?: number;
  max_price?: number;
  min_commission_rate?: number;
  min_discount_percent?: number;
  category?: string;
  marketplace?: string;
  only_official_stores?: boolean;
  only_coupons?: boolean;
  min_score?: number;
  keywords_whitelist?: string[];
  keywords_blacklist?: string[];
  repost_window_hours?: number;
}

export interface AutomationTemplateConfig {
  body?: string;
  tone?: string;
}

export interface AutomationRoute {
  id: string;
  source_id: string;
  target_type: 'group' | 'list';
  target_id: string;
  template_id?: string;
  is_active: boolean;
  filters?: AutomationFilters;
  template_config?: AutomationTemplateConfig;
  created_at?: string;
  updated_at?: string;
}

export interface AutomationSource {
  id: string;
  user_id: string;
  channel_id?: string;
  external_group_id?: string;
  name: string;
  is_active: boolean;
  source_type: 'group_monitor' | 'radar_offers';
  config?: any;
  created_at?: string;
  updated_at?: string;
  automation_routes?: AutomationRoute[];
}
