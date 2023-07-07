import { Router } from 'express';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import subcategoryController from '../../controllers/subcategory.controller';
import urlMiddleware from '../../middlewares/url.middleware';

const subcategoryRoutes: Router = Router();

subcategoryRoutes
  .route(`/${process.env.VERSION}/subcategory/search-item/:search`)
  .all(ecommerceMiddleware)
  .get(subcategoryController.search);

subcategoryRoutes
  .route(`/${process.env.VERSION}/subcategory/list-admin`)
  .all(ecommerceMiddleware)
  .get(subcategoryController.getList);

subcategoryRoutes
  .route(`/${process.env.VERSION}/subcategory/add-subcategory`)
  .all(ecommerceMiddleware)
  .post(subcategoryController.addCategory);

subcategoryRoutes
  .route(`/${process.env.VERSION}/subcategory/modify-subcategory/:id`)
  .all(ecommerceMiddleware)
  .put(subcategoryController.editCategory)
  .delete(subcategoryController.removeCategory);

subcategoryRoutes
  .route(`/${process.env.VERSION}/subcategory/list`)
  .all(urlMiddleware)
  .get(subcategoryController.getList);

export default subcategoryRoutes;
