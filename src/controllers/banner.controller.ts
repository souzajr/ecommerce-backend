import { Request, Response } from 'express';
import { remove as removeImage } from '../config/utils/spaces';
import Banner from '../models/banner.model';

class BannerController {
  async list(req: Request, res: Response) {
    const { ecommerce } = req;

    const banners = await Banner.find({ ecommerce })
      .sort({ position: -1 })
      .lean();

    return res.status(200).json(banners);
  }

  async listAdmin(req: Request, res: Response) {
    const { page = 1 } = req.query;

    const banners = await Banner.paginate(
      {},
      {
        page: page as number,
        limit: 10,
        sort: { _id: -1 },
        lean: true,
      }
    );

    return res.status(200).json(banners);
  }

  async add(req: Request, res: Response) {
    const { ecommerce } = req;
    const { url, link } = req.body;

    if (!url) {
      return res
        .status(400)
        .json({ mensagem: 'A URL do banner é obrigatória' });
    }

    await Banner.create({
      ecommerce,
      link,
      url,
    });

    return res.status(201).end();
  }

  async remove(req: Request, res: Response) {
    const { ecommerce } = req;
    const { id } = req.params;
    const { file } = req.query;

    await removeImage(file as string);

    await Banner.deleteOne({ ecommerce, _id: id });

    return res.status(204).end();
  }
}

export default new BannerController();
