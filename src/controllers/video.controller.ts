import { Request, Response } from 'express';
import Ecommerce from '../models/ecommerce.model';
import PLAN_TYPES from '../config/utils/planTypes';
import { existOrError } from '../config/utils/validation';
import Video from '../models/video.model';

class VideoController {
  listVideos = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { page = 1 } = req.query;
    const { productId } = req.params;

    if (!productId) {
      return res.status(404).json({ mensagem: 'Algo deu errado' });
    }

    const videos = await Video.paginate(
      {
        ecommerce,
        porduct: productId,
      },
      {
        page: page as number,
        limit: 10,
        sort: { _id: -1 },
        lean: true,
      }
    );

    return res.status(200).json(videos);
  };

  listVideosEcommerce = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { productId } = req.params;

    if (!productId) {
      return res.status(404).json({ mensagem: 'Algo deu errado' });
    }

    const videos = await Video.find({
      ecommerce,
      porduct: productId,
    });

    return res.status(200).json(videos);
  };

  createVideo = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { name, url, type } = req.body;
    const { productId } = req.params;

    try {
      existOrError(productId, 'Algo deu errado');
      existOrError(name, 'Digite o nome do vídeo');
      existOrError(url, 'Digite o link do vídeo');
      existOrError(type, 'Escolha o tipo do vídeo');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const checkEcommerce = await Ecommerce.findOne({ _id: ecommerce })
      .populate('plan')
      .lean();

    if (!checkEcommerce || checkEcommerce.plan?.type !== PLAN_TYPES.COURSE) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    await Video.create({
      ecommerce,
      product: productId,
      name,
      url,
      type,
    });

    return res.status(201).end();
  };

  removeVideo = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    await Video.deleteOne({ _id: id, ecommerce });

    return res.status(204).end();
  };
}

export default new VideoController();
