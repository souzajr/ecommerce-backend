import { Router } from 'express';
import bannerController from '../../controllers/banner.controller';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import urlMiddleware from '../../middlewares/url.middleware';

const bannerRoutes: Router = Router();

bannerRoutes
  .route(`/${process.env.VERSION}/banner/list`)
  .all(urlMiddleware)
  .get(bannerController.list);

bannerRoutes
  .route(`/${process.env.VERSION}/banner/list-admin`)
  .all(ecommerceMiddleware)
  .get(bannerController.listAdmin);

bannerRoutes
  .route(`/${process.env.VERSION}/banner/add`)
  .all(ecommerceMiddleware)
  .post(bannerController.add);

bannerRoutes
  .route(`/${process.env.VERSION}/banner/remove/:id`)
  .all(ecommerceMiddleware)
  .delete(bannerController.remove);

export default bannerRoutes;
