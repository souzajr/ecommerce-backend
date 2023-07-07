import { Request, Response } from 'express';
import { existOrError, notSpecialOrError } from '../config/utils/validation';
import Product from '../models/product.model';
import SubCategory from '../models/subcategory.model';

class SubCategoryController {
  async search(req: Request, res: Response) {
    const { ecommerce } = req;
    const { search } = req.params;

    const subcategories = await SubCategory.find({
      ecommerce,
      name: new RegExp(search.trim(), 'i'),
    })
      .sort({ _id: -1 })
      .lean();

    return res.status(200).json(subcategories);
  }

  async getList(req: Request, res: Response) {
    const { ecommerce } = req;

    const { page = 1 } = req.query;

    const subcategories = await SubCategory.paginate(
      {
        ecommerce,
      },
      {
        populate: 'category',
        page: page as number,
        limit: 10,
        sort: { _id: -1 },
        lean: true,
      }
    );

    return res.status(200).json(subcategories);
  }

  async addCategory(req: Request, res: Response) {
    const { ecommerce } = req;
    const { name, category } = req.body;

    try {
      existOrError(name, 'Digite o nome da categoria');
      notSpecialOrError(
        name,
        'O nome da categoria não pode ter caracteres especiais'
      );
      existOrError(category, 'Escolha a categoria principal');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const url = name.trim().toLowerCase().replaceAll(' ', '-');

    const checkNameAndURL = await SubCategory.exists({ ecommerce, url }).lean();

    if (checkNameAndURL) {
      return res
        .status(400)
        .json('Já existe uma subcategoria com esse nome, digite outro nome');
    }

    await SubCategory.create({
      ecommerce,
      category,
      name,
      url,
    });

    return res.status(201).end();
  }

  async editCategory(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { name, category } = req.body;

    try {
      existOrError(name, 'Digite o nome da subcategoria');
      notSpecialOrError(
        name,
        'O nome da subcategoria não pode ter caracteres especiais'
      );
      existOrError(category, 'Escolha a categoria principal');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const url = name.trim().toLowerCase().replaceAll(' ', '-');

    const oldCategory = await SubCategory.findOne({
      ecommerce,
      _id: id,
    }).lean();

    if (!oldCategory) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    if (oldCategory.name !== name) {
      const checkNameAndURL = await SubCategory.exists({
        ecommerce,
        url,
      }).lean();

      if (checkNameAndURL) {
        return res
          .status(400)
          .json('Já existe uma subcategoria com esse nome, digite outro nome');
      }
    }

    await SubCategory.findOneAndUpdate(
      { _id: id, ecommerce },
      { name, url, category }
    );

    return res.status(200).end();
  }

  async removeCategory(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;

    const products = await Product.exists({
      ecommerce,
      subcategory: id,
    }).lean();

    if (products) {
      return res
        .status(400)
        .json(
          'Não foi possível apagar essa subcategoria. Os produtos não podem possuir essa subcategoria para que ela seja apagada, altere primeiro antes de apagar'
        );
    }

    await SubCategory.deleteOne({ _id: id, ecommerce });

    return res.status(204).end();
  }
}

export default new SubCategoryController();
