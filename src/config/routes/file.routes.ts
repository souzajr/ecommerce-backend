import { Router } from 'express';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import fileController from '../../controllers/file.controller';
import urlMiddleware from '../../middlewares/url.middleware';

const fileRoutes: Router = Router();

fileRoutes
  .route(`/${process.env.VERSION}/file/list-files/:productId`)
  .all(ecommerceMiddleware)
  .get(fileController.listFiles);

fileRoutes
  .route(`/${process.env.VERSION}/file/list-files-ecommerce/:productId`)
  .all(urlMiddleware)
  .get(fileController.listFilesEcommerce);

fileRoutes
  .route(`/${process.env.VERSION}/file/add-file/:productId`)
  .all(ecommerceMiddleware)
  .post(fileController.createFile);

fileRoutes
  .route(`/${process.env.VERSION}/file/remove-file/:fileId/key/:fileKey`)
  .all(ecommerceMiddleware)
  .delete(fileController.removeFile);

fileRoutes
  .route(`/${process.env.VERSION}/file/download-file-ecommerce/:fileKey`)
  .all(ecommerceMiddleware)
  .get(fileController.downloadFileUrlEcommerce);

fileRoutes
  .route(`/${process.env.VERSION}/file/remove-all-files/:productId`)
  .all(ecommerceMiddleware)
  .delete(fileController.removeAllFilesFromProduct);

export default fileRoutes;
