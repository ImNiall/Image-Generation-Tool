export interface DiagramResult {
  id: string;
  imageUrl: string;
  explanation?: string;
  originalImageUrl: string;
  createdAt: number;
  // user_id is implicit via database query
}

// Fix: Added User interface for ProfilePage component.
export interface User {
  name: string;
  email: string;
  subscription: {
    plan: string;
    status: string;
    renewsOn: string;
  };
  paymentMethod: {
    cardType: string;
    last4: string;
    expires: string;
  };
}
