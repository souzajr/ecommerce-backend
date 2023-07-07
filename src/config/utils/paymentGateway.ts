import pagarme from 'pagarme';
import qs from 'qs';
import { SignPlanProps, SubscriptionType } from './types';

export const createPlanBackoffice = async (
  name: string,
  amount: number
): Promise<string> => {
  const client = await pagarme.client.connect({
    api_key: process.env.PAGARME_API_KEY,
  });

  const plan = await client.plans.create({
    amount,
    days: 30,
    name,
    payment_methods: ['credit_card'],
  });

  return plan.id;
};

export const createPlanAdmin = async ({
  buyer,
  address,
  hash,
  gateway,
}: SignPlanProps): Promise<{
  id: string;
  status: string;
  current_period_end: string;
}> => {
  const client = await pagarme.client.connect({
    api_key: process.env.PAGARME_API_KEY,
  });

  const order = {
    plan_id: gateway,
    card_hash: hash,
    payment_method: 'credit_card',
    postback_url: `${process.env.API_URL}${process.env.PAGARME_POSTBACK}`,
    customer: {
      name: buyer.name,
      email: buyer.email,
      document_number: buyer.documents.document,
      phone: {
        number: buyer.phone.substring(2),
        ddd: buyer.phone.substring(0, 2),
      },
      address: {
        zipcode: address.zipCode,
        neighborhood: address.neighborhood,
        street: address.street,
        street_number: address.streetNumber,
        complementary: address.complement || 'Sem complemento',
      },
    },
  };

  const subscription = await client.subscriptions.create(order);

  return {
    id: subscription.id,
    status: subscription.status,
    current_period_end: subscription.current_period_end,
  };
};

export const getSubscription = async (
  id: string
): Promise<SubscriptionType> => {
  const client = await pagarme.client.connect({
    api_key: process.env.PAGARME_API_KEY,
  });

  const getPlan: SubscriptionType = await client.subscriptions.find({ id });

  return {
    current_period_end: getPlan.current_period_end,
    card_last_digits: getPlan.card_last_digits,
    status: getPlan.status,
    card_brand: getPlan.card_brand,
    plan: {
      amount: getPlan.plan.amount,
      name: getPlan.plan.name,
    },
  };
};

export const changeSubscriptionPlan = async (
  subscriptionPlan: string,
  newPlan: string
): Promise<{
  id: string;
  status: string;
  current_period_end: string;
}> => {
  const client = await pagarme.client.connect({
    api_key: process.env.PAGARME_API_KEY,
  });

  const subscription = await client.subscriptions.update({
    id: subscriptionPlan,
    plan_id: newPlan,
  });

  return {
    id: subscription.id,
    status: subscription.status,
    current_period_end: subscription.current_period_end,
  };
};

export const changeSubscriptionPlanCard = async (
  subscriptionPlan: string,
  hash: string
): Promise<{
  id: string;
  status: string;
}> => {
  const client = await pagarme.client.connect({
    api_key: process.env.PAGARME_API_KEY,
  });

  const subscription = await client.subscriptions.update({
    id: subscriptionPlan,
    card_hash: hash,
    payment_method: 'credit_card',
  });

  return {
    id: subscription.id,
    status: subscription.status,
  };
};

export const cancelSubscriptionPlan = async (
  subscriptionPlan: string
): Promise<{ status: string; current_period_end: string }> => {
  const client = await pagarme.client.connect({
    api_key: process.env.PAGARME_API_KEY,
  });

  const subscription = await client.subscriptions.cancel({
    id: subscriptionPlan,
  });

  return subscription;
};

export const verifyPayment = async (
  request: any,
  header: string
): Promise<{
  status: boolean;
  subscription?: {
    id: string;
    status: string;
    current_period_end: string;
  };
}> => {
  const verifySignature = pagarme.postback.verifySignature(
    process.env.PAGARME_API_KEY,
    qs.stringify(request),
    header.replace('sha1=', '')
  );

  if (!verifySignature) {
    return {
      status: false,
    };
  }

  const client = await pagarme.client.connect({
    api_key: process.env.PAGARME_API_KEY,
  });

  const subscription = await client.subscriptions.find({
    id: request.transaction.id,
  });

  if (!subscription) {
    return {
      status: false,
    };
  }

  return {
    status: true,
    subscription: {
      id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
    },
  };
};
