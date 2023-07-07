import { Request, Response } from 'express';

class ErrorController {
  notFound(req: Request, res: Response) {
    return res.status(404).end();
  }
}

export default new ErrorController();
