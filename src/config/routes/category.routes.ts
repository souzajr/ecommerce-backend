import { Router } from 'express';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import categoryController from '../../controllers/category.controller';
import urlMiddleware from '../../middlewares/url.middleware';

const categoryRoutes: Router = Router();

categoryRoutes
  .route(`/${process.env.VERSION}/category/search-item/:search`)
  .all(ecommerceMiddleware)
  .get(categoryController.search);

categoryRoutes
  .route(`/${process.env.VERSION}/category/list-admin`)
  .all(ecommerceMiddleware)
  .get(categoryController.getList);

categoryRoutes
  .route(`/${process.env.VERSION}/category/add-category`)
  .all(ecommerceMiddleware)
  .post(categoryController.addCategory);

categoryRoutes
  .route(`/${process.env.VERSION}/category/modify-category/:id`)
  .all(ecommerceMiddleware)
  .put(categoryController.editCategory)
  .delete(categoryController.removeCategory);

categoryRoutes
  .route(`/${process.env.VERSION}/category/list`)
  .all(urlMiddleware)
  .get(categoryController.getList);

export default categoryRoutes;
