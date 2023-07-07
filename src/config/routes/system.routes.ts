import { Router } from 'express';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import systemController from '../../controllers/system.controller';

const systemRoutes: Router = Router();

systemRoutes
  .route(`/${process.env.VERSION}/system/get-presigned-url`)
  .all(ecommerceMiddleware)
  .post(systemController.getPresignedUrl);

systemRoutes
  .route(`/${process.env.VERSION}/system/check-signature`)
  .get(systemController.checkSignature);

systemRoutes
  .route(`/${process.env.VERSION}/system/remove-old-ecommerce`)
  .get(systemController.removeOldEcommerce);

export default systemRoutes;
