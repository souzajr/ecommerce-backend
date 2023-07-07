import { Router } from 'express';
import userController from '../../controllers/user.controller';
import authMiddleware from '../../middlewares/auth.middleware';

const userRouters: Router = Router();

userRouters
  .route(`/${process.env.VERSION}/user/register-admin-owner`)
  .post(userController.registerAdminOwner);

userRouters
  .route(`/${process.env.VERSION}/user/recovery-password`)
  .post(userController.recoveryPassword)
  .put(userController.resetPassword);

userRouters
  .route(`/${process.env.VERSION}/user/change-infos`)
  .all(authMiddleware)
  .put(userController.changeInfos);

userRouters
  .route(`/${process.env.VERSION}/user/check-password`)
  .all(authMiddleware)
  .get(userController.checkUserPassword);

export default userRouters;
