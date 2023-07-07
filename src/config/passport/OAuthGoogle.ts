import { Request } from 'express';
import passport from 'passport';
import GoogleStrategy, { VerifyCallback } from 'passport-google-oauth2';

import User from '../../models/user.model';
import ROLES from '../utils/roles';

interface Profile {
  id: string;
  displayName: string;
  emails: [
    {
      value: string;
    }
  ];
}

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((str: string, done) => done(null, str));

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: `${process.env.CLIENT_GOOGLE_ID}`,
      clientSecret: `${process.env.CLIENT_GOOGLE_SECRET}`,
      callbackURL: `${process.env.API_URL}/${process.env.VERSION}/auth/social-check/google`,
      passReqToCallback: true,
    },
    async (
      request: Request,
      accessToken: unknown,
      refreshToken: unknown,
      profile: Profile,
      done: VerifyCallback
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

      const user = await User.findOne({ googleId: profile.id }).lean();

      if (user) return done(null, `${user._id}&${state}`);

      const userFromDB = await User.findOne({
        email: profile.emails[0].value.trim().toLowerCase(),
      });

      if (userFromDB) {
        userFromDB.googleId = profile.id;

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
        googleId: profile.id,
      });

      return done(null, `${newUser._id}&${state}`);
    }
  )
);

const GooglePassport = passport;

export default GooglePassport;
