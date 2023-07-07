import { Request, Response } from 'express';
import crypto from 'crypto';
import {
  encryptPassword,
  comparePassword,
} from '../config/utils/encryptPassword';
import ROLES from '../config/utils/roles';
import { generateAuthTokens } from '../config/utils/authJwtToken';
import {
  equalsOrError,
  existOrError,
  hasDigitOrError,
  hasLowerOrError,
  hasSpecialOrError,
  hasUpperOrError,
  notSpaceOrError,
  strongOrError,
  validEmailOrError,
  checkIfUserAlreadyExist,
  validadeDocument,
  validCepOrError,
} from '../config/utils/validation';
import User from '../models/user.model';
import EmailHandler from '../config/email';

class UserController {
  async registerAdminOwner(req: Request, res: Response) {
    const { name, email, password, confirmPassword } = req.body;

    try {
      existOrError(name, 'Digite seu nome');
      existOrError(email, 'Digite seu e-mail');
      validEmailOrError(email, 'E-mail inválido');
      await checkIfUserAlreadyExist(email, 'Esse e-mail já está cadastrado');
      existOrError(password, 'Digite sua senha');
      strongOrError(password, 'A senha deve ter pelo menos 8 caracteres', 8);
      hasDigitOrError(password, 'A senha deve ter pelo menos um número');
      hasUpperOrError(
        password,
        'A senha deve ter pelo menos um caractere maiúsculo'
      );
      hasLowerOrError(
        password,
        'A senha deve ter pelo menos um caractere minúsculo'
      );
      notSpaceOrError(password, 'A senha não pode ter espaços');
      hasSpecialOrError(
        password,
        'A senha precisa ter pelo menos um caractere especial'
      );
      existOrError(confirmPassword, 'Digite sua confirmação de senha');
      equalsOrError(
        password,
        confirmPassword,
        'A confirmação de senha precisa ser igual a senha'
      );
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const user = await User.create({
      name,
      email,
      password: encryptPassword(password),
      role: ROLES.ADMIN_OWNER,
    });

    const tokens = generateAuthTokens(user._id);

    EmailHandler.adminRegister(user.email, user.name);

    return res.status(201).json({ user, ...tokens });
  }

  async recoveryPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
      existOrError(email, 'Digite seu e-mail');
      validEmailOrError(email, 'E-mail inválido');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const user = await User.findOne({ email });

    if (!user || user.deletedAt) return res.status(200).end();

    const token = crypto.randomBytes(64).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    EmailHandler.recoveryMail(user.email, token);

    return res.status(200).end();
  }

  async resetPassword(req: Request, res: Response) {
    const { token, password, confirmPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user || user.deletedAt) {
      return res.status(400).json({
        mensagem: 'O token de redefinição de senha é inválido ou expirou',
      });
    }

    try {
      existOrError(password, 'Digite sua senha');
      strongOrError(password, 'A senha deve ter pelo menos 8 caracteres', 8);
      hasDigitOrError(password, 'A senha deve ter pelo menos um número');
      hasUpperOrError(
        password,
        'A senha deve ter pelo menos um caractere maiúsculo'
      );
      hasLowerOrError(
        password,
        'A senha deve ter pelo menos um caractere minúsculo'
      );
      notSpaceOrError(password, 'A senha não pode ter espaços');
      hasSpecialOrError(
        password,
        'A senha precisa ter pelo menos um caractere especial'
      );
      existOrError(confirmPassword, 'Digite sua confirmação de senha');
      equalsOrError(
        password,
        confirmPassword,
        'A confirmação de senha precisa ser igual a senha'
      );
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.password = encryptPassword(password);

    await user.save();

    EmailHandler.alertOfChange(user.email);

    return res.status(200).end();
  }

  async changeInfos(req: Request, res: Response) {
    const { userId } = req;
    const request = { ...req.body };

    if (request.type === 'profile') {
      try {
        existOrError(request.name, 'Digite seu nome');
        existOrError(request.email, 'Digite seu e-mail');
        validEmailOrError(request.email, 'E-mail inválido');
        existOrError(request.phone, 'Digite seu telefone');
        existOrError(request.documents.typeDoc, 'Escolha o tipo do documento');
        existOrError(request.documents.document, 'Digite o documento');
        validadeDocument(
          request.documents.typeDoc,
          request.documents.document,
          'Documento inválido'
        );
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      await User.updateOne(
        { _id: userId },
        {
          name: request.name,
          email: request.email.toLocaleLowerCase().trim(),
          phone: request.phone
            .replace('(', '')
            .replace(')', '')
            .replace('-', '')
            .replaceAll(' ', '')
            .replaceAll('_', '')
            .trim(),
          documents: {
            ...request.documents,
          },
        }
      );
    }

    if (request.type === 'address') {
      try {
        existOrError(
          request.street,
          'Digite a rua ou avenida do endereço de cobrança'
        );
        existOrError(
          request.streetNumber,
          'Digite a número do endereço de cobrança'
        );
        existOrError(
          request.neighborhood,
          'Digite o bairro do endereço de cobrança'
        );
        existOrError(request.city, 'Digite a cidade do endereço de cobrança');
        existOrError(request.state, 'Escolha o estado do endereço de cobrança');
        existOrError(request.zipCode, 'Digite o CEP do endereço de cobrança');
        await validCepOrError(request.zipCode, 'CEP inválido');
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      delete request.type;

      await User.updateOne(
        { _id: userId },
        {
          address: {
            ...request,
            zipCode: request.zipCode.replace('.', '').replace('-', '').trim(),
          },
        }
      );
    }

    if (request.type === 'password') {
      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(500).json({ mensagem: 'Algo deu errado' });
      }

      const isSocial = (user.googleId || user.facebookId) && !user.password;

      try {
        if (!isSocial) {
          existOrError(request.currentPassword, 'Digite sua senha atual');
        }

        existOrError(request.newPassword, 'Digite sua nova senha senha');
        strongOrError(
          request.newPassword,
          'A nova senha deve ter pelo menos 8 caracteres',
          8
        );
        hasDigitOrError(
          request.newPassword,
          'A nova senha deve ter pelo menos um número'
        );
        hasUpperOrError(
          request.newPassword,
          'A nova senha deve ter pelo menos um caractere maiúsculo'
        );
        hasLowerOrError(
          request.newPassword,
          'A nova senha deve ter pelo menos um caractere minúsculo'
        );
        notSpaceOrError(request.newPassword, 'A senha não pode ter espaços');
        hasSpecialOrError(
          request.newPassword,
          'A nova senha precisa ter pelo menos um caractere especial'
        );
        existOrError(
          request.confirmNewPassword,
          'Digite sua nova confirmação de senha'
        );
        equalsOrError(
          request.newPassword,
          request.confirmNewPassword,
          'A nova confirmação de senha precisa ser igual a senha'
        );
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      if (!isSocial) {
        const isMatch = comparePassword(
          request.currentPassword,
          user.password || ''
        );

        if (!isMatch) {
          return res.status(400).json({ mensagem: 'Senha atual inválida' });
        }
      }

      user.password = encryptPassword(request.newPassword);

      await user.save();
    }

    return res.status(200).end();
  }

  async checkUserPassword(req: Request, res: Response) {
    const { userId } = req;

    const user = await User.findOne({ _id: userId }).lean();

    if (!user) {
      return res.status(500).json({ mensagem: 'Algo deu errado' });
    }

    if ((user.googleId || user.facebookId) && !user.password) {
      return res.status(200).json({ isSocial: true });
    }

    return res.status(200).json({ isSocial: false });
  }
}

export default new UserController();
