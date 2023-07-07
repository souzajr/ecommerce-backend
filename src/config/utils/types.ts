export interface SignPlanProps {
  buyer: {
    name: string;
    email: string;
    phone: string;
    documents: {
      typeDoc: string;
      document: string;
    };
  };
  address: {
    street: string;
    streetNumber: string;
    neighborhood: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  hash: string;
  plan?: string;
  gateway?: string;
}

export interface TransporterProps {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  secret: string;
}

export interface SubscriptionType {
  current_period_end: string;
  card_last_digits: string;
  status: string;
  card_brand: string;
  plan: {
    amount: number;
    name: string;
  };
}
