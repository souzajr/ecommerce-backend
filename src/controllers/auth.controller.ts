import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import { existOrError, validEmailOrError } from '../config/utils/validation';
import User from '../models/user.model';
import GooglePassport from '../config/passport/OAuthGoogle';
import FacebookPassport from '../config/passport/OAuthFacebook';
import { generateAuthTokens, verifyToken } from '../config/utils/authJwtToken';
import ROLES from '../config/utils/roles';
import EmailHandler from '../config/email';

class AuthController {
  async authenticate(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      existOrError(email, 'Digite seu email');
      validEmailOrError(email, 'E-mail inválido');
      existOrError(password, 'Digite sua senha');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const user = await User.findOne({ email });

    if (!user || user.deletedAt) {
      return res.status(400).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    if (user.password) {
      const isMatch = bcrypt.compareSync(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ mensagem: 'E-mail ou senha inválidos' });
      }
    } else {
      user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      await user.save();
    }

    const tokens = generateAuthTokens(user._id);

    user.password = undefined;

    return res.status(200).json({
      user,
      ...tokens,
    });
  }

  getUrlSocial(req: Request, res: Response) {
    const { social } = req.params;
    const { setUrl } = req.query;

    if (!social || !setUrl) {
      return res.send('Algo deu errado');
    }

    return res.redirect(
      `/${process.env.VERSION}/auth/${social}-auth?setUrl=${setUrl}`
    );
  }

  socialGoogle(req: Request, res: Response, next: NextFunction) {
    const { setUrl } = req.query;

    return GooglePassport.authenticate(
      'google',
      {
        scope: ['email', 'profile'],
        state: setUrl as string,
      },
      () => next()
    )(req, res, next);
  }

  socialFacebook(req: Request, res: Response, next: NextFunction) {
    const { setUrl } = req.query;

    return FacebookPassport.authenticate(
      'facebook',
      {
        scope: ['email'],
        state: setUrl as string,
      },
      () => next()
    )(req, res, next);
  }

  async social(req: Request, res: Response) {
    const infoRequest = req.user as string;

    const getUser = infoRequest?.split('&')[0];
    const getUrl = infoRequest?.split('&')[1];

    if (getUser && getUrl) {
      if (getUser === 'A sua conta social deve ter um e-mail') {
        const formatedRedirect = `${getUrl}?errorMessage=${getUser}`;

        return res.redirect(formatedRedirect);
      }

      const user = await User.findOne({ _id: getUser }).lean();

      if (!user || user.deletedAt) {
        const formatedRedirect = `${getUrl}?errorMessage=Algo deu errado`;

        return res.redirect(formatedRedirect);
      }

      const tokens = generateAuthTokens(user._id);

      const formatedRedirect = `${getUrl}?socialLogin=true&email${user.email}&role=${user.role}&name=${user.name}&email=${user.email}&token=${tokens.token}&refresh_token=${tokens.refresh_token}`;

      return res.redirect(formatedRedirect);
    }

    return res.sendFile(path.join(__dirname, '../../public/reload.html'));
  }

  async socialAdmin(req: Request, res: Response) {
    const { email, sub, name, provider } = req.body;

    if (!email || !sub || !name || !provider) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível fazer login com sua conta' });
    }

    let user = await User.findOne({ email });

    if (
      (user?.[provider === 'google' ? 'googleId' : 'facebookId'] &&
        user?.[provider === 'google' ? 'googleId' : 'facebookId'] !== sub) ||
      user?.deletedAt
    ) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível fazer login com sua conta' });
    }

    if (user) {
      if (provider === 'google') {
        user.googleId = sub;
      }

      if (provider === 'facebook') {
        user.facebookId = sub;
      }

      await user.save();
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        role: ROLES.ADMIN_OWNER,
        ...(provider === 'google' ? { googleId: sub } : { facebookId: sub }),
      });

      EmailHandler.adminRegister(user.email, user.name);
    }

    user.password = undefined;

    const tokens = generateAuthTokens(user._id);

    return res.status(200).json({
      user,
      ...tokens,
    });
  }

  async generateNewTokenFromRefresh(req: Request, res: Response) {
    const { oldRefreshToken } = req.params;

    if (!oldRefreshToken) {
      return res.status(401).end();
    }

    const checkToken = verifyToken('refresh', oldRefreshToken);

    if (checkToken.error || !checkToken.data) {
      return res.status(401).end();
    }

    const tokens = generateAuthTokens(checkToken.data.id);

    return res.status(200).json({ ...tokens });
  }
}

export default new AuthController();
