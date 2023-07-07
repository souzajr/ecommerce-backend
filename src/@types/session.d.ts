import 'express-session';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    url: string;
  }
}
