import CartItem from '@vue-storefront/core/modules/cart/types/CartItem'
import productChecksum from './productChecksum'
import optimizeProduct from './optimizeProduct'

const readAssociated = product => {
  if (product.product_links) { return product.product_links.filter(p => p.link_type === 'associated').map(p => p.product) } else { return product }
}
const isDefined = product => typeof product !== 'undefined' || product !== null

const applyQty = product => ({
  ...product,
  qty: product.qty && typeof product.qty !== 'number' ? parseInt(product.qty) : product.qty
});

const applyChecksumForBundles = product =>
  product.type_id === 'bundle' ? { ...product, checksum: productChecksum(product) } : product

const prepareProductsToAdd = (product: CartItem): CartItem[] => {
  const products = product.type_id === 'grouped' ? readAssociated(product) : [product]
  return products
    .filter(isDefined)
    .map(applyQty)
    .map(p => optimizeProduct(p))
    .map(applyChecksumForBundles);
};

export default prepareProductsToAdd;
