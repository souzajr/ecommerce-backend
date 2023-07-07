import { Request, Response } from 'express';
import Newsletter from '../models/newsletter.model';
import { existOrError, validEmailOrError } from '../config/utils/validation';

class NewsletterController {
  async addUser(req: Request, res: Response) {
    const { name, email } = req.body;

    try {
      existOrError(name, 'Digite seu nome');
      existOrError(email, 'Digite seu email');
      validEmailOrError(email, 'E-mail inválido');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const checkIfAlreadyExist = await Newsletter.findOne({ email }).lean();

    if (!checkIfAlreadyExist) {
      await Newsletter.create({ name, email });
    }

    return res.status(201).end();
  }
}

export default new NewsletterController();
