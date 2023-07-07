import { Router } from 'express';
import newsletterController from '../../controllers/newsletter.controller';

const newsletterRoutes: Router = Router();

newsletterRoutes.post(
  `/${process.env.VERSION}/newsletter/add-user`,
  newsletterController.addUser
);

export default newsletterRoutes;
