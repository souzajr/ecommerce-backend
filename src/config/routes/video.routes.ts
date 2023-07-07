import { Router } from 'express';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import videoController from '../../controllers/video.controller';
import urlMiddleware from '../../middlewares/url.middleware';

const videoRoutes: Router = Router();

videoRoutes
  .route(`/${process.env.VERSION}/video/list-videos/:productId`)
  .all(ecommerceMiddleware)
  .get(videoController.listVideos);

videoRoutes
  .route(`/${process.env.VERSION}/video/list-videos-ecommerce/:productId`)
  .all(urlMiddleware)
  .get(videoController.listVideosEcommerce);

videoRoutes
  .route(`/${process.env.VERSION}/video/add-video/:productId`)
  .all(ecommerceMiddleware)
  .post(videoController.createVideo);

videoRoutes
  .route(`/${process.env.VERSION}/video/remove-video/:id`)
  .all(ecommerceMiddleware)
  .delete(videoController.removeVideo);

export default videoRoutes;
