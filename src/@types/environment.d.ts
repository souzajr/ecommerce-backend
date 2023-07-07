export {};

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace NodeJS {
    export interface ProcessEnv {
      PORT?: string;
      AUTH_SECRET: string;
      AUTH_REFRESH_SECRET: string;
      VERSION: string;
      API_URL: string;
      ADMIN_URL: string;
      CLIENT_FACEBOOK_ID: string;
      CLIENT_FACEBOOK_SECRET: string;
      CLIENT_GOOGLE_ID: string;
      CLIENT_GOOGLE_SECRET: string;
      DB_HOST: string;
      MAIL_HOST: string;
      MAIL_PORT: string;
      MAIL_SECURE: string;
      MAIL_AUTH_USER: string;
      MAIL_AUTH_PASS: string;
      PAGARME_API_KEY: string;
      PAGARME_POSTBACK: string;
      UPDATE_DOMAIN_LIST_URL: string;
      FRONTEND_ECOMMERCE_NAME: string;
      DIGITAL_OCEAN_TOKEN: string;
      DIGITAL_OCEAN_ENDPOINT: string;
      DIGITAL_OCEAN_IAM_USER_KEY: string;
      DIGITAL_OCEAN_IAM_USER_SECRET: string;
      DIGITAL_OCEAN_BUCKET_NAME: string;
      DIGITAL_OCEAN_URL: string;
    }
  }
}
