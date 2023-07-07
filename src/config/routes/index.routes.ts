import { Router } from 'express';

import userRouters from './user.routes';
import ecommerceRouters from './ecommerce.routes';
import authRouters from './auth.routes';
import bannerRoutes from './banner.routes';
import productRoutes from './product.routes';
import newsletterRoutes from './newsletter.routes';
import planRouters from './plan.routes';
import categoryRoutes from './category.routes';
import subcategoryRoutes from './subcategory.routes';
import tagRoutes from './tag.routes';
import systemRoutes from './system.routes';
import fileRoutes from './file.routes';
import videoRoutes from './video.routes';
import errorRoutes from './error.routes';

const router: Router = Router();

router.use(authRouters);
router.use(ecommerceRouters);
router.use(userRouters);
router.use(bannerRoutes);
router.use(productRoutes);
router.use(newsletterRoutes);
router.use(planRouters);
router.use(categoryRoutes);
router.use(subcategoryRoutes);
router.use(tagRoutes);
router.use(systemRoutes);
router.use(fileRoutes);
router.use(videoRoutes);
router.use(errorRoutes);

export default router;
