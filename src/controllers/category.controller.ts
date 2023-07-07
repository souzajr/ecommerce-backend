import { Request, Response } from 'express';
import { existOrError, notSpecialOrError } from '../config/utils/validation';
import Category from '../models/category.model';
import Product from '../models/product.model';
import SubCategory from '../models/subcategory.model';

class CategoryController {
  async search(req: Request, res: Response) {
    const { ecommerce } = req;
    const { search } = req.params;

    const categories = await Category.find({
      ecommerce,
      name: new RegExp(search.trim(), 'i'),
    })
      .sort({ _id: -1 })
      .lean();

    return res.status(200).json(categories);
  }

  async getList(req: Request, res: Response) {
    const { ecommerce } = req;

    const { page = 1, limit = 10 } = req.query;

    const categories = await Category.paginate(
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

    return res.status(200).json(categories);
  }

  async addCategory(req: Request, res: Response) {
    const { ecommerce } = req;
    const { name } = req.body;

    try {
      existOrError(name, 'Digite o nome da categoria');
      notSpecialOrError(
        name,
        'O nome da categoria não pode ter caracteres especiais'
      );
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const url = name.trim().toLowerCase().replaceAll(' ', '-');

    const checkNameAndURL = await Category.exists({ ecommerce, url }).lean();

    if (checkNameAndURL) {
      return res
        .status(400)
        .json('Já existe uma categoria com esse nome, digite outro nome');
    }

    await Category.create({
      ecommerce,
      name,
      url,
    });

    return res.status(200).end();
  }

  async editCategory(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { name } = req.body;

    try {
      existOrError(name, 'Digite o nome da categoria');
      notSpecialOrError(
        name,
        'O nome da categoria não pode ter caracteres especiais'
      );
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const url = name.trim().toLowerCase().replaceAll(' ', '-');

    const oldCategory = await Category.findOne({ ecommerce, _id: id }).lean();

    if (!oldCategory) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    if (oldCategory.name !== name) {
      const checkNameAndURL = await Category.exists({ ecommerce, url }).lean();

      if (checkNameAndURL) {
        return res
          .status(400)
          .json('Já existe uma categoria com esse nome, digite outro nome');
      }
    }

    await Category.findOneAndUpdate({ _id: id, ecommerce }, { name, url });

    return res.status(200).end();
  }

  async removeCategory(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;

    const products = await Product.exists({ ecommerce, category: id }).lean();

    if (products) {
      return res
        .status(400)
        .json(
          'Não foi possível apagar essa categoria. Os produtos não podem possuir essa categoria para que ela seja apagada, altere primeiro antes de apagar'
        );
    }

    const subcategories = await SubCategory.exists({ category: id });

    if (subcategories) {
      return res
        .status(400)
        .json(
          'Não foi possível apagar essa categoria. As subcategorias não podem possuir essa categoria para que ela seja apagada, altere primeiro antes de apagar'
        );
    }

    await Category.deleteOne({ _id: id, ecommerce });

    return res.status(204).end();
  }
}

export default new CategoryController();
