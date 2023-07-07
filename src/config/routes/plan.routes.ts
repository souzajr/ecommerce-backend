import { Router } from 'express';
import planController from '../../controllers/plan.controller';
import authMiddleware from '../../middlewares/auth.middleware';
import backofficeMiddleware from '../../middlewares/backoffice.middleware';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';

const planRouters: Router = Router();

planRouters
  .route(`/${process.env.VERSION}/plan/get-list`)
  .all(authMiddleware)
  .get(planController.getList);

planRouters
  .route(`/${process.env.VERSION}/plan/sign-plan`)
  .all(authMiddleware)
  .post(planController.signPlan);

planRouters
  .route(`/${process.env.VERSION}/plan/create-plan`)
  .all(backofficeMiddleware)
  .post(planController.addPlan);

planRouters
  .route(`/${process.env.VERSION}/plan/get-info`)
  .all(ecommerceMiddleware)
  .get(planController.getInfo);

planRouters
  .route(`/${process.env.VERSION}/plan/change-plan`)
  .all(ecommerceMiddleware)
  .put(planController.changeSubscription);

planRouters
  .route(`/${process.env.VERSION}/plan/change-plan-card`)
  .all(ecommerceMiddleware)
  .put(planController.changeSubscriptionCard);

planRouters
  .route(`/${process.env.VERSION}/plan/cancel-plan`)
  .all(ecommerceMiddleware)
  .post(planController.cancelSubscription);

planRouters
  .route(`/${process.env.VERSION}/plan/reactive-plan`)
  .all(ecommerceMiddleware)
  .post(planController.reactiveSubscription);

planRouters
  .route(`${process.env.PAGARME_POSTBACK}`)
  .post(planController.postBackPayment);

export default planRouters;
