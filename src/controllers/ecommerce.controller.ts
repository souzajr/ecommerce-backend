import axios from 'axios';
import { Request, Response } from 'express';
import DOServices from '../config/utils/DOServices';
import { remove } from '../config/utils/spaces';
import {
  existOrError,
  isBooleanOrError,
  isIntegerOrError,
  validEmailOrError,
  validURLOrError,
  checkIfDomainAlreadyExist,
} from '../config/utils/validation';
import Ecommerce from '../models/ecommerce.model';
import EmailHandler from '../config/email';
import { formatInitialAndFinalDate } from '../config/utils/format';
import ECOMMERCE_STATUS from '../config/utils/ecommerceStatus';

class EcommerceController {
  async infos(req: Request, res: Response) {
    const { ecommerce } = req;

    const theme = await Ecommerce.findOne({
      _id: ecommerce,
      $or: [
        { status: ECOMMERCE_STATUS.ACTIVE },
        { status: ECOMMERCE_STATUS.PAUSED },
      ],
    }).lean();

    if (!theme) {
      return res.status(500).end();
    }

    const fixedTheme = {
      ...theme,
      gateway: undefined,
      plan: undefined,
      owner: undefined,
      allowedUsers: undefined,
      planEnd: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      payment: {
        ...theme.payment,
        apiKey: undefined,
      },
    };

    return res.status(200).json({
      theme: fixedTheme,
    });
  }

  async infosAdmin(req: Request, res: Response) {
    const { ecommerce } = req;

    const theme = await Ecommerce.findOne({ _id: ecommerce }).lean();

    if (!theme) {
      return res.status(500).end();
    }

    return res.status(200).json({
      theme,
    });
  }

  async getList(req: Request, res: Response) {
    const id = req.userId;

    const ecommerces = await Ecommerce.find({
      owner: id,
      $or: [
        { status: ECOMMERCE_STATUS.ACTIVE },
        { status: ECOMMERCE_STATUS.PAUSED },
      ],
    }).lean();

    return res.status(200).json(ecommerces);
  }

  async verify(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensagem: 'Digite o ID do ecommerce' });
    }

    const getEcommerce = await Ecommerce.findOne({ _id: id })
      .populate('plan')
      .lean();

    if (!getEcommerce) {
      return res.status(404).json({ mensagem: 'Ecommerce não encontrado ' });
    }

    if (!getEcommerce.plan?.type) {
      return res.status(404).json({ mensagem: 'Ecommerce não encontrado ' });
    }

    return res
      .status(200)
      .json({ status: getEcommerce.status, type: getEcommerce.plan.type });
  }

  async getListAdmin(req: Request, res: Response) {
    const { page = 1, initialDate, finalDate } = req.query;

    const { formatedInitialDate, formatedFinalDate } =
      formatInitialAndFinalDate(initialDate as string, finalDate as string);

    const ecommerces = await Ecommerce.paginate(
      {
        createdAt: {
          $gte: formatedInitialDate,
          $lte: formatedFinalDate,
        },
      },
      {
        populate: 'owner',
        page: page as number,
        limit: 10,
        sort: { _id: -1 },
        lean: true,
      }
    );

    return res.status(200).json(ecommerces);
  }

  async changeEcommerceInfo(req: Request, res: Response) {
    const { ecommerce } = req;
    const request = { ...req.body };

    if (request.type === 'url') {
      const cleanUrl = request?.url?.trim()?.toLowerCase();

      try {
        existOrError(cleanUrl, 'Digite a URL do seu site');
        validURLOrError(cleanUrl, 'URL inválida');
        checkIfDomainAlreadyExist(
          cleanUrl,
          'Essa URL já está em uso por outro usuário'
        );
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      await Ecommerce.updateOne({ _id: ecommerce }, { url: cleanUrl });

      const urls = await Ecommerce.find({ url: { $ne: null } })
        .select('url')
        .lean();

      const filteredUrls = urls.filter(item => item.url !== cleanUrl);

      const domains = [
        ...filteredUrls.map(item => ({
          domain: item.url,
          type: 'PRIMARY',
        })),
        ...filteredUrls.map(item => ({
          domain: `www.${item.url}`,
          type: 'ALIAS',
        })),
      ];

      domains.push(
        {
          domain: cleanUrl,
          type: 'PRIMARY',
        },
        {
          domain: `www.${cleanUrl}`,
          type: 'ALIAS',
        }
      );

      try {
        await axios.put(
          process.env.UPDATE_DOMAIN_LIST_URL,
          {
            spec: {
              ...DOServices,
              domains,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.DIGITAL_OCEAN_TOKEN}`,
            },
          }
        );
      } catch {
        return res.status(500).json({ mensagem: 'Algo deu errado' });
      }
    }

    if (request.type === 'colors') {
      try {
        existOrError(request.colors, 'Escolha as cores do seu site');
        existOrError(request.colors.primary, 'Escolha a cor primária');
        existOrError(request.colors.secondary, 'Escolha a cor secundária');
        existOrError(request.colors.terciary, 'Escolha a cor terciária');
        existOrError(request.colors.quaternary, 'Escolha a cor quaternária');
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      await Ecommerce.updateOne({ _id: ecommerce }, { colors: request.colors });
    }

    if (request.type === 'infos') {
      try {
        existOrError(request.name, 'Digite o nome do seu site');
        if (request.email) {
          validEmailOrError(request.email, 'O e-mail digitado é inválido');
        }
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      delete request.type;

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          ...request,
        }
      );
    }

    if (request.type === 'logotipo') {
      if (request.oldLogotipo) {
        await remove(request.oldLogotipo);
      }

      await Ecommerce.findOneAndUpdate(
        { _id: ecommerce },
        { logotipo: request.logotipo }
      );

      return res.status(200).end();
    }

    if (request.type === 'payment') {
      try {
        existOrError(request.apiKey, 'Digite a API KEY');
        existOrError(request.encryptionkey, 'Digite a ENCRYPTION KEY');
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      delete request.type;

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          'payment.apiKey': request.apiKey,
          'payment.encryptionkey': request.encryptionkey,
        }
      );
    }

    if (request.type === 'creditCard') {
      try {
        existOrError(
          request.creditCard,
          'Digite as informações do cartão de crédito'
        );
        isIntegerOrError(
          request.creditCard.maxInstallments,
          'Digite o número máximo de parcelas'
        );
        isIntegerOrError(
          request.creditCard.interestRate,
          'Digite a taxa de juros'
        );
        isIntegerOrError(
          request.creditCard.freeInstallments,
          'Digite o número de parcelas isentas de juros'
        );
        isIntegerOrError(
          request.creditCard.discount,
          'Digite o desconto do método de pagamento'
        );
        isBooleanOrError(
          request.creditCard.enabled,
          'Selecione a opção de habilitar ou desabilitar o método de pagamento'
        );
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      delete request.type;

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          'payment.creditCard': {
            ...request.creditCard,
          },
        }
      );
    }

    if (request.type === 'boleto') {
      try {
        existOrError(
          request.boleto,
          'Digite as informações do boleto bancário'
        );
        isIntegerOrError(
          request.boleto.discount,
          'Digite o desconto do método de pagamento'
        );
        isBooleanOrError(
          request.boleto.enabled,
          'Selecione a opção de habilitar ou desabilitar o método de pagamento'
        );
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      delete request.type;

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          'payment.boleto': {
            ...request.boleto,
          },
        }
      );
    }

    if (request.type === 'pix') {
      try {
        existOrError(request.pix, 'Digite as informações do Pix');
        isIntegerOrError(
          request.pix.discount,
          'Digite o desconto do método de pagamento'
        );
        isBooleanOrError(
          request.pix.enabled,
          'Selecione a opção de habilitar ou desabilitar o método de pagamento'
        );
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      delete request.type;

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          'payment.pix': {
            ...request.pix,
          },
        }
      );
    }

    if (request.type === 'delivery') {
      try {
        existOrError(request.zipCode, 'Digite as informações do Pix');
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          delivery: {
            apiKey: request.apiKey,
            zipCode: request.zipCode.replace('.', '').replace('-', '').trim(),
          },
        }
      );
    }

    if (request.type === 'smtp') {
      try {
        existOrError(request.user, 'Digite o usuário do seu e-mail');
        validEmailOrError(request.user, 'Digite um usuário válido');
        existOrError(request.secret, 'Digite a senha do seu e-mail');
        existOrError(request.host, 'Digite o host do seu e-mail');
        isIntegerOrError(request.port, 'Digite a porta do seu e-mail');
        isBooleanOrError(
          request.secure,
          'Escolha se o seu e-mail possui conexão segura ou não'
        );
      } catch (mensagem) {
        return res.status(400).json({ mensagem });
      }

      delete request.type;

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          smtp: {
            ...request,
          },
        }
      );
    }

    return res.status(200).end();
  }

  async addMenu(req: Request, res: Response) {
    const { ecommerce } = req;
    const { name, url } = req.body;

    const getEcommerce = await Ecommerce.findOneAndUpdate(
      { _id: ecommerce },
      {
        $push: {
          menuLinks: {
            name,
            url,
          },
        },
      },
      {
        new: true,
      }
    ).lean();

    return res.status(200).json(getEcommerce?.menuLinks);
  }

  async removeMenu(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;

    await Ecommerce.updateOne(
      { _id: ecommerce },
      {
        $pull: {
          menuLinks: {
            _id: id,
          },
        },
      }
    );

    return res.status(204).end();
  }

  async testEmail(req: Request, res: Response) {
    const { ecommerce } = req;

    const getEcommerce = await Ecommerce.findOne({ _id: ecommerce }).lean();

    if (!getEcommerce?.smtp) {
      return res
        .status(400)
        .json({ mensagem: 'Preencha suas informações de e-mail' });
    }

    EmailHandler.testEmail(
      getEcommerce.smtp,
      getEcommerce.name || 'PurpleTech'
    );

    return res.status(200).end();
  }
}

export default new EcommerceController();
