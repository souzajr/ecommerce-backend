import { Router } from 'express';
import FacebookPassport from '../passport/OAuthFacebook';
import GooglePassport from '../passport/OAuthGoogle';
import authController from '../../controllers/auth.controller';

const authRouters: Router = Router();

authRouters.post(
  `/${process.env.VERSION}/auth/login`,
  authController.authenticate
);

/* ============= SOCIAL LOGIN / GET URL ============= */
authRouters.get(
  `/${process.env.VERSION}/auth/social-login/:social`,
  authController.getUrlSocial
);

/* ============= SOCIAL LOGIN / GOOGLE ============= */
authRouters.get(
  `/${process.env.VERSION}/auth/google-auth`,
  authController.socialGoogle
);

authRouters.get(
  `/${process.env.VERSION}/auth/social-check/google`,
  GooglePassport.authenticate('google', {
    successRedirect: `/${process.env.VERSION}/auth/social-callback`,
    failureRedirect: `/${process.env.VERSION}/auth/social-callback`,
  })
);

/* ============= SOCIAL LOGIN / FACEBOOK ============= */
authRouters.get(
  `/${process.env.VERSION}/auth/facebook-auth`,
  authController.socialFacebook
);

authRouters.get(
  `/${process.env.VERSION}/auth/social-check/facebook`,
  FacebookPassport.authenticate('facebook', {
    successRedirect: `/${process.env.VERSION}/auth/social-callback`,
    failureRedirect: `/${process.env.VERSION}/auth/social-callback`,
  })
);

/* ============= SOCIAL LOGIN / CALLBACK ============= */
authRouters.get(
  `/${process.env.VERSION}/auth/social-callback`,
  authController.social
);

/* ============= SOCIAL LOGIN ADMIN ============= */
authRouters.post(
  `/${process.env.VERSION}/auth/social-login-admin`,
  authController.socialAdmin
);

authRouters.get(
  `/${process.env.VERSION}/auth/refresh-token/:oldRefreshToken`,
  authController.generateNewTokenFromRefresh
);

export default authRouters;
