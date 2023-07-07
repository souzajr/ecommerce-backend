import { Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import { remove, removeWithKey } from '../config/utils/spaces';
import {
  checkIfProductAlreadyExist,
  existOrError,
  isBooleanOrError,
  isIntegerOrError,
  isIntegerPositiveOrError,
  notSpecialOrError,
  checkIfIsAllowedType,
} from '../config/utils/validation';
import Product from '../models/product.model';
import File from '../models/file.model';
import Video from '../models/video.model';
import Category from '../models/category.model';
import Tag from '../models/tag.model';
import SubCategory from '../models/subcategory.model';
import { convertStringDateToTimeStamp } from '../config/utils/format';

class ProductController {
  async featured(req: Request, res: Response) {
    const { ecommerce } = req;

    const products = await Product.find({
      ecommerce,
      featured: true,
      showProduct: true,
    })
      .sort({ _id: -1 })
      .limit(9)
      .lean();

    return res.status(200).json(products);
  }

  async getListAdmin(req: Request, res: Response) {
    const { ecommerce } = req;

    const { page = 1 } = req.query;

    const products = await Product.paginate(
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

    return res.status(200).json(products);
  }

  async addProduct(req: Request, res: Response) {
    const { ecommerce } = req;

    const product = { ...req.body };

    try {
      existOrError(product.type, 'Escolha o tipo do produto');
      await checkIfIsAllowedType(
        ecommerce,
        product.type,
        'Tipo do produto não permitido'
      );
      existOrError(product.name, 'Escolha o nome do produto');
      notSpecialOrError(
        product.name,
        'O nome do produto não pode ter caracteres especiais'
      );

      product.url = product.name.trim().toLowerCase().replaceAll(' ', '-');

      await checkIfProductAlreadyExist(
        ecommerce,
        product.url,
        'Já existe um produto com esse nome'
      );
      isBooleanOrError(
        product.featured,
        'Escolha se o produto é ou não destaque'
      );
      isBooleanOrError(
        product.showProduct,
        'Escolha se o produto será visível ou não'
      );
      isBooleanOrError(
        product.catalog,
        'Escolha se o produto é ou não catálogo'
      );
      isIntegerOrError(product.price, 'Digite o preço do produto');

      if (product.price > 0) {
        product.price = Number((product.price * 100).toFixed(0));

        if (product.price.toString() === 'NaN' || product.price < 100) {
          throw new Error('Algo deu errado');
        }
      }

      product.freeProduct = product.price <= 0;

      if (product.promoPrice) {
        isIntegerPositiveOrError(
          product.promoPrice,
          'Digite o preço de promoção do produto'
        );

        if (product.promoPrice > 0) {
          product.promoPrice = Number((product.promoPrice * 100).toFixed(0));

          if (
            product.promoPrice.toString() === 'NaN' ||
            product.promoPrice < 100
          ) {
            throw new Error('Algo deu errado');
          }

          if (product.promoPrice <= product.price) {
            throw new Error(
              'O preço promocional deve ser maior que o preço normal'
            );
          }
        }
      }

      if (product.shipping) {
        isIntegerPositiveOrError(
          product.shipping.weight,
          'Digite o peso do produto'
        );
        isIntegerPositiveOrError(
          product.shipping.length,
          'Digite o comprimento do produto'
        );
        isIntegerPositiveOrError(
          product.shipping.width,
          'Digite a largura do produto'
        );
        isIntegerPositiveOrError(
          product.shipping.height,
          'Digite a altura do produto'
        );
        existOrError(
          product.shipping.description,
          'Digite a descrição do frete do produto'
        );
      }
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    await Product.create({ ecommerce, ...product });

    return res.status(201).end();
  }

  async removeProduct(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    const response = await Product.findOneAndRemove({
      ecommerce,
      _id: id,
    }).lean();

    if (response?.coverPhoto) {
      await remove(response.coverPhoto);
    }

    const files = await File.find({ ecommerce, product: id }).lean();

    await Promise.all([
      Promise.all(files?.map(async file => removeWithKey(file.key))),
      File.deleteMany({ ecommerce, product: id }),
      Video.deleteMany({ ecommerce, product: id }),
    ]);

    return res.status(204).end();
  }

  async search(req: Request, res: Response) {
    const { ecommerce } = req;
    const { search } = req.params;

    const products = await Product.find({
      ecommerce,
      name: new RegExp(search.trim(), 'i'),
    })
      .sort({ _id: -1 })
      .lean();

    return res.status(200).json(products);
  }

  async getDetails(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    const product = await Product.findOne({ _id: id, ecommerce })
      .populate('category')
      .populate('subCategory')
      .populate('tags')
      .lean();

    if (!product) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.status(200).json(product);
  }

  async addCoverImg(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { cover, oldImg } = req.body;

    if (!id || !cover) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    if (oldImg) {
      await remove(oldImg);
    }

    await Product.updateOne(
      {
        _id: id,
        ecommerce,
      },
      {
        coverPhoto: cover,
      }
    );

    return res.status(200).end();
  }

  async addGallery(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { gallery } = req.body;

    if (!id || !gallery || !gallery.length) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    const checkProductGallery = await Product.findOne({
      _id: id,
      ecommerce,
    }).lean();

    if (!checkProductGallery) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    if (
      checkProductGallery.gallery &&
      checkProductGallery.gallery?.length >= 6
    ) {
      return res.status(400).json({
        mensagem:
          'Você atingiu a quantidade máxima de fotos na galeria do produto',
      });
    }

    const response = await Product.findOneAndUpdate(
      {
        _id: id,
        ecommerce,
      },
      {
        $push: {
          gallery,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json(response?.gallery);
  }

  async removeItemGallery(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id, item } = req.params;

    if (!id || !item) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    await Product.findOneAndUpdate(
      {
        _id: id,
        ecommerce,
      },
      {
        $pull: {
          gallery: {
            _id: item,
          },
        },
      }
    );

    return res.status(200).end();
  }

  async changeProductInfos(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const request = { ...req.body };

    try {
      existOrError(id, 'Algo deu errado');
      existOrError(request.type, 'Escolha o tipo do produto');
      await checkIfIsAllowedType(
        ecommerce,
        request.type,
        'Tipo do produto não permitido'
      );
      existOrError(request.name, 'Escolha o nome do produto');
      notSpecialOrError(
        request.name,
        'O nome do produto não pode ter caracteres especiais'
      );

      const checkProductName = await Product.findOne({
        _id: id,
        ecommerce,
      }).lean();

      if (checkProductName?.name !== request.name) {
        request.url = request.name.trim().toLowerCase().replaceAll(' ', '-');

        await checkIfProductAlreadyExist(
          ecommerce,
          request.url,
          'Já existe um produto com esse nome'
        );
      }

      isBooleanOrError(
        request.featured,
        'Escolha se o produto é ou não destaque'
      );
      isBooleanOrError(
        request.showProduct,
        'Escolha se o produto será visível ou não'
      );
      isBooleanOrError(
        request.catalog,
        'Escolha se o produto é ou não catálogo'
      );
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    await Product.updateOne(
      {
        _id: id,
        ecommerce,
      },
      {
        ...request,
      }
    );

    return res.status(200).end();
  }

  async changeProductDescription(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { description, shortDescription } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Algo deu errado' });
    }

    await Product.updateOne(
      {
        _id: id,
        ecommerce,
      },
      {
        description: sanitizeHtml(description),
        shortDescription: sanitizeHtml(shortDescription),
      }
    );

    return res.status(200).end();
  }

  async changeProductPrice(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const product = req.body;

    try {
      existOrError(id, 'Algo deu errado');
      isIntegerOrError(product.price, 'Digite o preço do produto');

      if (product.price > 0) {
        product.price = Number((product.price * 100).toFixed(0));

        if (product.price.toString() === 'NaN' || product.price < 100) {
          throw new Error('Algo deu errado');
        }
      }

      product.freeProduct = product.price <= 0;

      if (product.promoPrice) {
        isIntegerPositiveOrError(
          product.promoPrice,
          'Digite o preço de promoção do produto'
        );

        if (product.promoPrice > 0) {
          product.promoPrice = Number((product.promoPrice * 100).toFixed(0));

          if (
            product.promoPrice.toString() === 'NaN' ||
            product.promoPrice < 100
          ) {
            throw new Error('Algo deu errado');
          }

          if (product.promoPrice <= product.price) {
            throw new Error(
              'O preço promocional deve ser maior que o preço normal'
            );
          }
        }
      }
    } catch (message) {
      return res.status(400).json({ message });
    }

    await Product.updateOne(
      {
        _id: id,
        ecommerce,
      },
      {
        ...product,
      }
    );

    return res.status(200).end();
  }

  async changeProductShipping(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const request = { ...req.body };

    try {
      existOrError(id, 'Algo deu errado');
      isIntegerPositiveOrError(request.weight, 'Digite o peso do produto');
      isIntegerPositiveOrError(
        request.length,
        'Digite o comprimento do produto'
      );
      isIntegerPositiveOrError(request.width, 'Digite a largura do produto');
      isIntegerPositiveOrError(request.height, 'Digite a altura do produto');
      existOrError(
        request.description,
        'Digite a descrição do frete do produto'
      );
      isIntegerOrError(request.stock, 'Digite o estoque do produto');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    await Product.updateOne(
      {
        _id: id,
        ecommerce,
      },
      {
        stock: request.stock,
        shipping: {
          weight: request.weight,
          height: request.height,
          length: request.length,
          width: request.width,
          description: request.description,
        },
      }
    );

    return res.status(200).end();
  }

  async changeProductPresale(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { presaleDate } = req.body;

    if (presaleDate) {
      const today = convertStringDateToTimeStamp();
      const checkPresaleDate = convertStringDateToTimeStamp(presaleDate);

      if (today > checkPresaleDate) {
        return res.status(400).json({
          mensagem: 'A data de pré-venda não pode ser menor que hoje',
        });
      }
    }

    await Product.updateOne({ _id: id, ecommerce }, { presaleDate });

    return res.status(200).end();
  }

  async getDetailsEcommerce(req: Request, res: Response) {
    const { ecommerce } = req;
    const { url } = req.params;

    if (!url) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    const product = await Product.findOne({ url, ecommerce, showProduct: true })
      .populate('category')
      .populate('subCategory')
      .populate('tags')
      .lean();

    if (!product) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.status(200).json(product);
  }

  async getRelatedProducts(req: Request, res: Response) {
    const { ecommerce } = req;

    const products = await Product.aggregate([
      { $match: { showProduct: true, ecommerce } },
      { $sample: { size: 4 } },
    ]);

    return res.status(200).json(products);
  }

  async addProductVariation(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { type, value } = req.body;

    const getProduct = await Product.findOneAndUpdate(
      { _id: id, ecommerce },
      {
        $push: {
          variations: {
            type,
            value,
          },
        },
      },
      {
        new: true,
      }
    ).lean();

    return res.status(200).json(getProduct?.variations);
  }

  async removeProductVariation(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id, idVariation } = req.params;

    await Product.updateOne(
      { _id: id, ecommerce },
      {
        $pull: {
          variations: {
            _id: idVariation,
          },
        },
      }
    );

    return res.status(204).end();
  }

  async removeAllProductVariation(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;

    await Product.updateOne(
      { _id: id, ecommerce },
      {
        variations: [],
      }
    );

    return res.status(204).end();
  }

  async getListShopPage(req: Request, res: Response) {
    const { ecommerce } = req;

    const { page = 1, search, category, tag, subcategory } = req.query;

    let hasCategory = null;
    let hasSubcategory = null;
    let hasTag = null;

    if (category) {
      hasCategory = await Category.findOne({
        url: typeof category === 'string' && category.trim().toLowerCase(),
      }).lean();
    }

    if (subcategory) {
      hasSubcategory = await SubCategory.findOne({
        url:
          typeof subcategory === 'string' && subcategory.trim().toLowerCase(),
      }).lean();
    }

    if (tag) {
      hasTag = await Tag.findOne({
        url: typeof tag === 'string' && tag.trim().toLowerCase(),
      }).lean();
    }

    const products = await Product.paginate(
      {
        ecommerce,
        showProduct: true,
        ...(hasCategory && { category: hasCategory._id }),
        ...(hasSubcategory && { subCategory: hasSubcategory._id }),
        ...(hasTag && { tags: hasTag._id }),
        ...(search &&
          typeof search === 'string' && {
            name: new RegExp(search.trim(), 'i'),
          }),
      },
      {
        populate: ['category', 'subCategory', 'tags'],
        page: page as number,
        limit: 9,
        sort: { _id: -1 },
        lean: true,
      }
    );

    return res.status(200).json(products);
  }
}

export default new ProductController();
