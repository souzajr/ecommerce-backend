import { Router } from 'express';
import productController from '../../controllers/product.controller';
import ecommerceMiddleware from '../../middlewares/ecommerce.middleware';
import urlMiddleware from '../../middlewares/url.middleware';

const productRoutes: Router = Router();

productRoutes
  .route(`/${process.env.VERSION}/product/featured`)
  .all(urlMiddleware)
  .get(productController.featured);

productRoutes
  .route(`/${process.env.VERSION}/product/list-admin`)
  .all(ecommerceMiddleware)
  .get(productController.getListAdmin);

productRoutes
  .route(`/${process.env.VERSION}/product/add-product`)
  .all(ecommerceMiddleware)
  .post(productController.addProduct);

productRoutes
  .route(`/${process.env.VERSION}/product/remove-product/:id`)
  .all(ecommerceMiddleware)
  .delete(productController.removeProduct);

productRoutes
  .route(`/${process.env.VERSION}/product/search-item/:search`)
  .all(ecommerceMiddleware)
  .get(productController.search);

productRoutes
  .route(`/${process.env.VERSION}/product/get-details/:id`)
  .all(ecommerceMiddleware)
  .get(productController.getDetails);

productRoutes
  .route(`/${process.env.VERSION}/product/add-cover/:id`)
  .all(ecommerceMiddleware)
  .post(productController.addCoverImg);

productRoutes
  .route(`/${process.env.VERSION}/product/add-gallery/:id`)
  .all(ecommerceMiddleware)
  .post(productController.addGallery);

productRoutes
  .route(`/${process.env.VERSION}/product/remove-item-gallery/:id/item/:item`)
  .all(ecommerceMiddleware)
  .delete(productController.removeItemGallery);

productRoutes
  .route(`/${process.env.VERSION}/product/change-product-infos/:id`)
  .all(ecommerceMiddleware)
  .put(productController.changeProductInfos);

productRoutes
  .route(`/${process.env.VERSION}/product/change-product-description/:id`)
  .all(ecommerceMiddleware)
  .put(productController.changeProductDescription);

productRoutes
  .route(`/${process.env.VERSION}/product/change-product-price/:id`)
  .all(ecommerceMiddleware)
  .put(productController.changeProductPrice);

productRoutes
  .route(`/${process.env.VERSION}/product/change-product-shipping/:id`)
  .all(ecommerceMiddleware)
  .put(productController.changeProductShipping);

productRoutes
  .route(`/${process.env.VERSION}/product/change-product-presale/:id`)
  .all(ecommerceMiddleware)
  .put(productController.changeProductPresale);

productRoutes
  .route(`/${process.env.VERSION}/product/remove-all-variations/:id`)
  .all(ecommerceMiddleware)
  .delete(productController.removeAllProductVariation);

productRoutes
  .route(`/${process.env.VERSION}/product/get-details-ecommerce/:url`)
  .all(urlMiddleware)
  .get(productController.getDetailsEcommerce);

productRoutes
  .route(`/${process.env.VERSION}/product/get-related-products`)
  .all(urlMiddleware)
  .get(productController.getRelatedProducts);

productRoutes
  .route(`/${process.env.VERSION}/product/product-variation/:id`)
  .all(ecommerceMiddleware)
  .post(productController.addProductVariation);

productRoutes
  .route(
    `/${process.env.VERSION}/product/product-variation/:id/remove/:idVariation`
  )
  .all(ecommerceMiddleware)
  .delete(productController.removeProductVariation);

productRoutes
  .route(`/${process.env.VERSION}/product/shop-list`)
  .all(urlMiddleware)
  .get(productController.getListShopPage);

export default productRoutes;
