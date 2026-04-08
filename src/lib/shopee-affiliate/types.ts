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

export interface ProductNode {
  productName: string;
  imageUrl: string;
  price?: string;
  priceMin?: number;
  priceMax?: number;
  originalPrice?: string;
  discount?: string;
  priceDiscountRate?: string;
  commission?: string | number;
  commissionRate?: string | number;
  productLink?: string;
  offerLink?: string;
}

export interface ProductListResponse {
  productList: {
    nodes: ProductNode[];
  };
}

export interface ProductOfferV2Response {
  productOfferV2: {
    nodes: ProductNode[];
  };
}

export interface ShopeeClientConfig {
  appId?: string;
  secret?: string;
}
