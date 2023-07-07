import { Router } from 'express';
import ecommerceController from '../../controllers/ecommerce.controller';
import authMiddleware from '../../middlewares/auth.middleware';
import backofficeMiddleware from '../../middlewares/backoffice.middleware';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import urlMiddleware from '../../middlewares/url.middleware';

const ecommerceRouters: Router = Router();

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/infos`)
  .all(urlMiddleware)
  .get(ecommerceController.infos);

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/infos-admin`)
  .all(ecommerceMiddleware)
  .get(ecommerceController.infosAdmin);

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/change-infos`)
  .all(ecommerceMiddleware)
  .put(ecommerceController.changeEcommerceInfo);

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/get-list`)
  .all(authMiddleware)
  .get(ecommerceController.getList);

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/verify/:id`)
  .all(authMiddleware)
  .get(ecommerceController.verify);

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/get-list-admin`)
  .all(backofficeMiddleware)
  .get(ecommerceController.getListAdmin);

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/menu/add`)
  .all(ecommerceMiddleware)
  .post(ecommerceController.addMenu);

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/menu/remove/:id`)
  .all(ecommerceMiddleware)
  .delete(ecommerceController.removeMenu);

ecommerceRouters
  .route(`/${process.env.VERSION}/ecommerce/test-email`)
  .all(ecommerceMiddleware)
  .post(ecommerceController.testEmail);

export default ecommerceRouters;
