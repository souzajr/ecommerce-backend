import { cnpj, cpf } from 'cpf-cnpj-validator';
import { Request, Response } from 'express';
import ECOMMERCE_STATUS from '../config/utils/ecommerceStatus';
import {
  createPlanBackoffice,
  createPlanAdmin,
  getSubscription,
  changeSubscriptionPlan,
  changeSubscriptionPlanCard,
  cancelSubscriptionPlan,
  verifyPayment,
} from '../config/utils/paymentGateway';
import PAYMENT_STATUS from '../config/utils/paymentStatus';
import { SignPlanProps } from '../config/utils/types';
import {
  checkIfPlanAlreadyExist,
  existOrError,
  validEmailOrError,
  validadeDocument,
  validCepOrError,
  checkType,
} from '../config/utils/validation';
import Ecommerce from '../models/ecommerce.model';
import Plan from '../models/plan.model';
import User from '../models/user.model';
import EmailHandler from '../config/email';
import { convertMoney } from '../config/utils/format';
import PLAN_TYPES from '../config/utils/planTypes';
import File from '../models/file.model';
import { removeWithKey } from '../config/utils/spaces';
import Product from '../models/product.model';
import Video from '../models/video.model';

class PlanController {
  async getList(req: Request, res: Response) {
    const plans = await Plan.find().lean();

    return res.status(200).json(plans);
  }

  async signPlan(req: Request, res: Response) {
    const id = req.userId;

    const { buyer, address, hash, plan } = req.body as SignPlanProps;

    try {
      existOrError(id, 'Algo deu errado');
      existOrError(buyer.name, 'Digite seu nome');
      existOrError(buyer.email, 'Digite seu e-mail');
      validEmailOrError(buyer.email, 'E-mail inválido');
      existOrError(buyer.phone, 'Digite seu telefone');
      existOrError(buyer.documents.typeDoc, 'Escolha o tipo do documento');
      existOrError(buyer.documents.document, 'Digite o documento');
      validadeDocument(
        buyer.documents.typeDoc,
        buyer.documents.document,
        'Documento inválido'
      );
      existOrError(
        address.street,
        'Digite a rua ou avenida do endereço de cobrança'
      );
      existOrError(
        address.streetNumber,
        'Digite a número do endereço de cobrança'
      );
      existOrError(
        address.neighborhood,
        'Digite o bairro do endereço de cobrança'
      );
      existOrError(address.city, 'Digite a cidade do endereço de cobrança');
      existOrError(address.state, 'Escolha o estado do endereço de cobrança');
      existOrError(address.zipCode, 'Digite o CEP do endereço de cobrança');
      await validCepOrError(address.zipCode, 'CEP inválido');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const getPlan = await Plan.findOne({ _id: plan }).lean();

    if (!getPlan) {
      return res.status(500).json({ mensagem: 'Algo deu errado' });
    }

    const data = {
      hash,
      gateway: getPlan.gateway,
      address: {
        ...address,
        zipCode: address.zipCode.replace('.', '').replace('-', '').trim(),
      },
      buyer: {
        ...buyer,
        email: buyer.email.toLocaleLowerCase().trim(),
        phone: buyer.phone
          .replace('(', '')
          .replace(')', '')
          .replace('-', '')
          .replaceAll(' ', '')
          .replaceAll('_', '')
          .trim(),
        documents: {
          ...buyer.documents,
          document:
            buyer.documents.typeDoc === 'pf'
              ? cpf.strip(buyer.documents.document)
              : cnpj.strip(buyer.documents.document),
        },
      },
    };

    try {
      await User.updateOne(
        { _id: id },
        {
          name: data.buyer.name,
          email: data.buyer.email,
          phone: data.buyer.phone,
          documents: data.buyer.documents,
          address,
        }
      );

      const response = await createPlanAdmin(data);

      if (response.status !== PAYMENT_STATUS.PAID) {
        return res.status(400).json({
          mensagem:
            'Infelizmente, não foi possível concluir seu pagamento. Por favor, tente novamente',
        });
      }

      const ecommerce = await Ecommerce.create({
        owner: id,
        name: buyer.name,
        status: ECOMMERCE_STATUS.ACTIVE,
        gateway: response.id,
        current_period_end: response.current_period_end,
        plan: getPlan._id,
        menuLinks: [
          {
            name: 'Início',
            url: '/',
          },
          {
            name: 'Loja',
            url: '/loja',
          },
        ],
        colors: {
          primary: '#ffec87',
          secondary: '#ce6679',
          terciary: '#56453a',
          quaternary: '#deefff',
        },
        font: {
          name: 'Lato Regular',
          file: 'Lato_Regular.ttf',
        },
        payment: {
          creditCard: {
            interestRate: 7,
            freeInstallments: 1,
            maxInstallments: 12,
            discount: 0,
            enabled: true,
          },
          boleto: {
            discount: 0,
            enabled: true,
          },
          pix: {
            discount: 0,
            enabled: true,
          },
        },
      });

      EmailHandler.signInPlan(
        buyer.email,
        buyer.name,
        `${getPlan.name} (${convertMoney(getPlan.price)}/mês)`
      );

      return res.status(200).json(ecommerce);
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }
  }

  async addPlan(req: Request, res: Response) {
    const { name, price, description, type } = req.body;

    try {
      existOrError(name, 'Digite o nome do plano');
      existOrError(price, 'Digite o preço do plano');
      checkType(type, 'Escolha o tipo correto do plano');
      await checkIfPlanAlreadyExist(name, 'Já existe um plano com esse nome');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    try {
      const gateway = await createPlanBackoffice(name, price);

      const plan = await Plan.create({
        gateway,
        name,
        price,
        description,
        type,
      });

      return res.status(201).json(plan);
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }
  }

  async changePlan(req: Request, res: Response) {
    const { id, name, price, description } = req.body;

    try {
      existOrError(id, 'Algo deu errado');
      existOrError(price, 'Digite o preço do plano');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    await Plan.updateOne({ _id: id }, { name, price, description });

    return res.status(200).end();
  }

  async getInfo(req: Request, res: Response) {
    const { ecommerce } = req;

    const getEcommerce = await Ecommerce.findOne({ _id: ecommerce }).lean();

    try {
      const getSubscriptionInfos = await getSubscription(
        getEcommerce?.gateway || ''
      );

      return res.status(200).json(getSubscriptionInfos);
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }
  }

  async changeSubscription(req: Request, res: Response) {
    const { ecommerce } = req;
    const { newPlan } = req.body;

    if (!newPlan) {
      return res.status(400).json({ mensagem: 'Selecione um plano' });
    }

    try {
      const getPlan = await Plan.findOne({ _id: newPlan }).lean();

      if (!getPlan) {
        return res.status(500).json({ mensagem: 'Algo deu errado' });
      }

      const getEcommerce = await Ecommerce.findOne({ _id: ecommerce })
        .populate('plan')
        .populate('owner')
        .lean();

      if (!getEcommerce || !getEcommerce.owner || !getEcommerce.plan) {
        return res.status(400).json({ mensagem: 'Algo deu errado' });
      }

      const response = await changeSubscriptionPlan(
        getEcommerce.gateway,
        getPlan.gateway
      );

      if (response.status !== PAYMENT_STATUS.PAID) {
        return res.status(400).json({
          mensagem:
            'Não conseguimos validar seu cartão de crédito. Por favor, regularize seu cartão',
        });
      }

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          plan: getPlan._id,
          gateway: response.id,
          status: ECOMMERCE_STATUS.ACTIVE,
          current_period_end: response.current_period_end,
        }
      );

      if (
        getEcommerce.plan.type === PLAN_TYPES.COURSE &&
        getPlan.type === PLAN_TYPES.DIGITAL
      ) {
        await Promise.all([
          Video.deleteMany({ ecommerce }),
          Product.updateMany(
            {
              ecommerce,
              type: PLAN_TYPES.COURSE,
            },
            {
              type: PLAN_TYPES.DIGITAL,
            }
          ),
        ]);
      }

      if (
        (getEcommerce.plan.type === PLAN_TYPES.DIGITAL ||
          getEcommerce.plan.type === PLAN_TYPES.COURSE) &&
        getPlan.type === PLAN_TYPES.PHYSICAL
      ) {
        const files = await File.find({ ecommerce }).lean();

        await Promise.all([
          Promise.all(files?.map(async file => removeWithKey(file.key))),
          File.deleteMany({ ecommerce }),
          Video.deleteMany({ ecommerce }),
          Product.updateMany(
            {
              ecommerce,
              $or: [{ type: PLAN_TYPES.DIGITAL }, { type: PLAN_TYPES.COURSE }],
            },
            {
              type: PLAN_TYPES.PHYSICAL,
            }
          ),
        ]);
      }

      EmailHandler.changePlan(
        getEcommerce.owner.email,
        getEcommerce.owner.name,
        `${getPlan.name} (${convertMoney(getPlan.price)}/mês)`,
        getEcommerce.name.toUpperCase()
      );

      return res.status(200).json({ type: getPlan.type });
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }
  }

  async changeSubscriptionCard(req: Request, res: Response) {
    const { ecommerce } = req;
    const { hash } = req.body;

    if (!hash) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    try {
      const getEcommerce = await Ecommerce.findOne({ _id: ecommerce })
        .populate('owner')
        .lean();

      if (!getEcommerce || !getEcommerce.owner) {
        return res.status(400).json({
          mensagem: 'Algo deu errado',
        });
      }

      const response = await changeSubscriptionPlanCard(
        getEcommerce.gateway,
        hash
      );

      if (response.status !== PAYMENT_STATUS.PAID) {
        return res.status(400).json({
          mensagem:
            'Não foi possível atualizar sua assinatura. Por favor, adicione outro cartão de crédito',
        });
      }

      await Ecommerce.updateOne(
        { _id: ecommerce },
        { status: ECOMMERCE_STATUS.ACTIVE, gateway: response.id }
      );

      EmailHandler.changePlanCard(
        getEcommerce.owner.email,
        getEcommerce.owner.name,
        getEcommerce.name.toUpperCase()
      );

      return res.status(200).end();
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    const { ecommerce } = req;

    try {
      const getEcommerce = await Ecommerce.findOne({ _id: ecommerce })
        .populate('owner')
        .lean();

      if (!getEcommerce || !getEcommerce.owner) {
        return res.status(400).json({
          mensagem: 'Algo deu errado',
        });
      }

      const response = await cancelSubscriptionPlan(getEcommerce.gateway);

      if (
        response.status === PAYMENT_STATUS.ENDED ||
        response.status === PAYMENT_STATUS.UNPAID ||
        response.status === PAYMENT_STATUS.CANCELED
      ) {
        await Ecommerce.updateOne(
          {
            _id: ecommerce,
          },
          {
            planEnd: response.current_period_end,
            status: ECOMMERCE_STATUS.PAUSED,
          }
        );

        EmailHandler.planCanceled(
          getEcommerce.owner.email,
          getEcommerce.owner.name,
          getEcommerce.name.toUpperCase()
        );
      }

      return res.status(200).end();
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }
  }

  async reactiveSubscription(req: Request, res: Response) {
    const { ecommerce, userId } = req;
    const { plan, hash } = req.body;

    const user = await User.findOne({ _id: userId }).lean();

    if (!user) {
      return res.status(500).json({ mensagem: 'Algo deu errado' });
    }

    try {
      existOrError(hash, 'Algo deu errado');
      existOrError(plan, 'Algo deu errado');
      existOrError(user.name, 'Digite seu nome');
      existOrError(user.email, 'Digite seu e-mail');
      validEmailOrError(user.email, 'E-mail inválido');
      existOrError(
        user?.documents?.typeDoc || '',
        'Escolha o tipo do documento'
      );
      existOrError(user?.documents?.document || '', 'Digite o documento');
      validadeDocument(
        user?.documents?.typeDoc || '',
        user?.documents?.document || '',
        'Documento inválido'
      );
      existOrError(
        user?.address?.street || '',
        'Digite a rua ou avenida do endereço de cobrança'
      );
      existOrError(
        user?.address?.streetNumber || '',
        'Digite a número do endereço de cobrança'
      );
      existOrError(
        user?.address?.neighborhood || '',
        'Digite o bairro do endereço de cobrança'
      );
      existOrError(
        user?.address?.city || '',
        'Digite a cidade do endereço de cobrança'
      );
      existOrError(
        user?.address?.state || '',
        'Escolha o estado do endereço de cobrança'
      );
      existOrError(
        user?.address?.zipCode || '',
        'Digite o CEP do endereço de cobrança'
      );
      await validCepOrError(user?.address?.zipCode || '', 'CEP inválido');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const getPlan = await Plan.findOne({ _id: plan }).lean();

    if (!getPlan) {
      return res.status(500).json({ mensagem: 'Algo deu errado' });
    }

    const data = {
      hash,
      gateway: getPlan.gateway,
      address: {
        street: user.address?.street || '',
        streetNumber: user.address?.streetNumber || '',
        neighborhood: user.address?.neighborhood || '',
        complement: user.address?.complement,
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode:
          user.address?.zipCode?.replace('.', '')?.replace('-', '')?.trim() ||
          '',
      },
      buyer: {
        ...user,
        email: user.email.toLocaleLowerCase().trim(),
        phone:
          user.phone
            ?.replace('(', '')
            .replace(')', '')
            .replace('-', '')
            .replaceAll(' ', '')
            .replaceAll('_', '')
            .trim() || '',
        documents: {
          typeDoc: user?.documents?.typeDoc || 'pf',
          document:
            user?.documents?.typeDoc === 'pf'
              ? cpf.strip(user?.documents?.document || '')
              : cnpj.strip(user?.documents?.document || ''),
        },
      },
    };

    try {
      const response = await createPlanAdmin(data);

      if (response.status !== PAYMENT_STATUS.PAID) {
        return res.status(400).json({
          mensagem:
            'Infelizmente, não foi possível concluir seu pagamento. Por favor, tente novamente',
        });
      }

      await Ecommerce.updateOne(
        { _id: ecommerce },
        {
          status: ECOMMERCE_STATUS.ACTIVE,
          gateway: response.id,
          plan: getPlan._id,
          planEnd: response.current_period_end,
        }
      );

      EmailHandler.signInPlan(
        user.email,
        user.name,
        `${getPlan.name} (${convertMoney(getPlan.price)}/mês)`
      );

      return res.status(200).json({ type: getPlan.type });
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }
  }

  async postBackPayment(req: Request, res: Response) {
    const request = { ...req.body };
    const header = req.headers['x-hub-signature'] as string;

    if (!request || !header) return res.status(401).end();

    try {
      const response = await verifyPayment(request, header);

      if (!response.status || !response.subscription) {
        return res.status(401).end();
      }

      const checkEcommerce = await Ecommerce.exists({
        gateway: response.subscription.id,
      }).lean();

      if (!checkEcommerce) {
        return res.status(401).end();
      }

      if (
        response.subscription.status === PAYMENT_STATUS.ENDED ||
        response.subscription.status === PAYMENT_STATUS.UNPAID ||
        response.subscription.status === PAYMENT_STATUS.CANCELED
      ) {
        const ecommerce = await Ecommerce.findOneAndUpdate(
          {
            _id: checkEcommerce._id,
          },
          {
            planEnd: response.subscription.current_period_end,
            status: ECOMMERCE_STATUS.PAUSED,
          }
        )
          .populate('owner')
          .lean();

        if (!ecommerce || !ecommerce.owner) {
          return res.status(401).end();
        }

        EmailHandler.planPaused(
          ecommerce.owner.email,
          ecommerce.owner.name,
          ecommerce.name.toUpperCase()
        );
      }

      if (response.subscription.status === PAYMENT_STATUS.PAID) {
        await Ecommerce.updateOne(
          {
            _id: checkEcommerce._id,
          },
          {
            planEnd: response.subscription.current_period_end,
            status: ECOMMERCE_STATUS.ACTIVE,
          }
        );
      }

      return res.status(200).end();
    } catch {
      return res.status(401).end();
    }
  }
}

export default new PlanController();
