import { Request, Response } from 'express';
import { existOrError, notSpecialOrError } from '../config/utils/validation';
import Product from '../models/product.model';
import Tag from '../models/tag.model';

class TagController {
  async search(req: Request, res: Response) {
    const { ecommerce } = req;
    const { search } = req.params;

    const tags = await Tag.find({
      ecommerce,
      name: new RegExp(search.trim(), 'i'),
    })
      .sort({ _id: -1 })
      .lean();

    return res.status(200).json(tags);
  }

  async getList(req: Request, res: Response) {
    const { ecommerce } = req;

    const { page = 1, limit = 10 } = req.query;

    const tags = await Tag.paginate(
      {
        ecommerce,
      },
      {
        page: page as number,
        limit: limit as number,
        sort: { _id: -1 },
        lean: true,
      }
    );

    return res.status(200).json(tags);
  }

  async addTag(req: Request, res: Response) {
    const { ecommerce } = req;
    const { name } = req.body;

    try {
      existOrError(name, 'Digite o nome da tag');
      notSpecialOrError(
        name,
        'O nome da tag não pode ter caracteres especiais'
      );
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const url = name.trim().toLowerCase().replaceAll(' ', '-');

    const checkNameAndURL = await Tag.exists({ ecommerce, url }).lean();

    if (checkNameAndURL) {
      return res
        .status(400)
        .json('Já existe uma categoria com esse nome, digite outro nome');
    }

    await Tag.create({
      ecommerce,
      name,
      url,
    });

    return res.status(201).end();
  }

  async editTag(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { name } = req.body;

    try {
      existOrError(name, 'Digite o nome da tag');
      notSpecialOrError(
        name,
        'O nome da tag não pode ter caracteres especiais'
      );
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const url = name.trim().toLowerCase().replaceAll(' ', '-');

    const oldCategory = await Tag.findOne({ ecommerce, _id: id }).lean();

    if (!oldCategory) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    if (oldCategory.name !== name) {
      const checkNameAndURL = await Tag.exists({ ecommerce, url }).lean();

      if (checkNameAndURL) {
        return res
          .status(400)
          .json('Já existe uma tag com esse nome, digite outro nome');
      }
    }

    await Tag.findOneAndUpdate({ _id: id, ecommerce }, { name, url });

    return res.status(200).end();
  }

  async removeTag(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;

    const products = await Product.exists({ ecommerce, tags: id }).lean();

    if (products) {
      return res
        .status(400)
        .json(
          'Não foi possível apagar essa tag. Os produtos não podem possuir essa tag para que ela seja apagada, altere primeiro antes de apagar'
        );
    }

    await Tag.deleteOne({ _id: id, ecommerce });

    return res.status(204).end();
  }
}

export default new TagController();
