export interface DiagramResult {
  id: string;
  imageUrl: string;
  explanation?: string;
  originalImageUrl: string;
  createdAt: number;
}

export interface User {
  name: string;
  email: string;
  subscription: {
    plan: 'Free' | 'Pro';
    status: 'Active' | 'Cancelled';
    renewsOn: string;
  };
  paymentMethod: {
    cardType: 'Visa' | 'Mastercard';
    last4: string;
    expires: string;
  };
}
