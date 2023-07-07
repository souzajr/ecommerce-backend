import { Request, Response } from 'express';
import File from '../models/file.model';
import Ecommerce from '../models/ecommerce.model';
import PLAN_TYPES from '../config/utils/planTypes';
import { existOrError } from '../config/utils/validation';
import { presignedUrlDownload, removeWithKey } from '../config/utils/spaces';

class FileController {
  listFiles = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { page = 1 } = req.query;
    const { productId } = req.params;

    if (!productId) {
      return res.status(404).json({ mensagem: 'Algo deu errado' });
    }

    const files = await File.paginate(
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

    return res.status(200).json(files);
  };

  listFilesEcommerce = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { productId } = req.params;

    if (!productId) {
      return res.status(404).json({ mensagem: 'Algo deu errado' });
    }

    const files = await File.find({
      ecommerce,
      porduct: productId,
    });

    return res.status(200).json(files);
  };

  createFile = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { name, key } = req.body;
    const { productId } = req.params;

    try {
      existOrError(productId, 'Algo deu errado');
      existOrError(name, 'Digite o nome do arquivo');
      existOrError(key, 'Digite a key do arquivo');
    } catch (mensagem) {
      return res.status(400).json({ mensagem });
    }

    const checkEcommerce = await Ecommerce.findOne({ _id: ecommerce })
      .populate('plan')
      .lean();

    if (
      !checkEcommerce ||
      (checkEcommerce.plan?.type !== PLAN_TYPES.DIGITAL &&
        checkEcommerce.plan?.type !== PLAN_TYPES.COURSE)
    ) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    await File.create({
      ecommerce,
      product: productId,
      name,
      key,
    });

    return res.status(201).end();
  };

  removeFile = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { fileId, fileKey } = req.params;

    if (!fileId || !fileKey) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    await removeWithKey(fileKey);

    await File.deleteOne({ _id: fileId, ecommerce, key: fileKey });

    return res.status(204).end();
  };

  downloadFileUrlEcommerce = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { fileKey } = req.params;

    const checkFile = await File.exists({
      key: fileKey,
      ecommerce,
    }).lean();

    if (!checkFile) {
      return res.status(401).end();
    }

    const response = await presignedUrlDownload(fileKey);

    if (!response) {
      return res.status(500).json({ mensagem: 'Algo deu errado' });
    }

    return res.status(200).json({ url: response });
  };

  removeAllFilesFromProduct = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ mensagem: 'Algo deu errado' });
    }

    const files = await File.find({ ecommerce, product: productId }).lean();

    await Promise.all([
      Promise.all(files?.map(async file => removeWithKey(file.key))),
      File.deleteMany({ ecommerce, product: productId }),
    ]);

    return res.status(204).end();
  };
}

export default new FileController();
