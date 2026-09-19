// Older catalogue records have no category; use their product type as a fallback.
export function productCategory(product) {
  if (product.category) return product.category;
  if (/coffee|kitchen|home/i.test(product.name)) return 'Home';
  if (/headphone|watch|keyboard|computer/i.test(product.name)) return 'Tech';
  return 'Everyday';
}

export function isSaleProduct(product) {
  return Boolean(product.isOnSale && product.onSaleQuantity > 0);
}

export function filterProducts(products, category, query) {
  const search = query.trim().toLowerCase();
  return products.filter(
    (product) =>
      (category === 'All' ||
        (category === 'Sale'
          ? isSaleProduct(product)
          : productCategory(product) === category)) &&
      `${product.name} ${product.description || ''}`
        .toLowerCase()
        .includes(search)
  );
}
