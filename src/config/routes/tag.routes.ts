import { Router } from 'express';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import tagController from '../../controllers/tag.controller';
import urlMiddleware from '../../middlewares/url.middleware';

const tagRoutes: Router = Router();

tagRoutes
  .route(`/${process.env.VERSION}/tag/search-item/:search`)
  .all(ecommerceMiddleware)
  .get(tagController.search);

tagRoutes
  .route(`/${process.env.VERSION}/tag/list-admin`)
  .all(ecommerceMiddleware)
  .get(tagController.getList);

tagRoutes
  .route(`/${process.env.VERSION}/tag/add-tag`)
  .all(ecommerceMiddleware)
  .post(tagController.addTag);

tagRoutes
  .route(`/${process.env.VERSION}/tag/modify-tag/:id`)
  .all(ecommerceMiddleware)
  .put(tagController.editTag)
  .delete(tagController.removeTag);

tagRoutes
  .route(`/${process.env.VERSION}/tag/list`)
  .all(urlMiddleware)
  .get(tagController.getList);

export default tagRoutes;
