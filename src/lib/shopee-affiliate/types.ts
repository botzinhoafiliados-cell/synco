export interface ShopeeGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

export interface GenerateShortLinkResponse {
  generateShortLink: {
    shortLink: string;
  };
}

export interface ShopeeClientConfig {
  appId?: string;
  secret?: string;
}
