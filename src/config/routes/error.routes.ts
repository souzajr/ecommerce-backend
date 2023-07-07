import { Router } from 'express';
import errorController from '../../controllers/error.controller';

const errorRoutes: Router = Router();

errorRoutes.use('*', errorController.notFound);

export default errorRoutes;
