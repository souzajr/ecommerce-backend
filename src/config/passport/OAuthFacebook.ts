import { Request } from 'express';
import passport from 'passport';
import * as PassportFacebook from 'passport-facebook';
import User from '../../models/user.model';
import ROLES from '../utils/roles';

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((str: string, done) => done(null, str));

passport.use(
  new PassportFacebook.Strategy(
    {
      clientID: `${process.env.CLIENT_FACEBOOK_ID}`,
      clientSecret: `${process.env.CLIENT_FACEBOOK_SECRET}`,
      callbackURL: `${process.env.API_URL}/${process.env.VERSION}/auth/social-check/facebook`,
      profileFields: ['id', 'displayName', 'email'],
      enableProof: true,
      authType: 'reauthenticate',
      passReqToCallback: true,
    } as PassportFacebook.StrategyOptionWithRequest,
    async (
      request: Request,
      accessToken: string,
      refreshToken: string,
      profile: PassportFacebook.Profile,
      // eslint-disable-next-line no-unused-vars
      done: (error: any, user?: any, info?: any) => void
    ) => {
      const { state } = request.query;

      if (
        !profile ||
        !profile.emails ||
        !profile.emails.length ||
        !profile.emails[0].value
      ) {
        return done(null, `A sua conta social deve ter um e-mail&${state}`);
      }

      const user = await User.findOne({ facebookId: profile.id }).lean();

      if (user) return done(null, `${user._id}&${state}`);

      const userFromDB = await User.findOne({
        email: profile.emails[0].value.trim().toLowerCase(),
      });

      if (userFromDB) {
        userFromDB.facebookId = profile.id;

        await userFromDB.save();

        return done(null, `${userFromDB._id}&${state}`);
      }

      const newUser = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value.trim().toLowerCase(),
        role:
          state === process.env.ADMIN_URL
            ? ROLES.ADMIN_OWNER
            : ROLES.NORMAL_USER,
        partner: false,
        facebookId: profile.id,
      });

      return done(null, `${newUser._id}&${state}`);
    }
  )
);

const FacebookPassport = passport;

export default FacebookPassport;
