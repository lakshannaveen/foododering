export const cartService = {
  getCart: () => {
    // Prefer localStorage, fall back to sessionStorage for compatibility
    const raw = localStorage.getItem("restaurant-cart") || sessionStorage.getItem("restaurant-cart");
    return raw ? JSON.parse(raw) : [];
  },
  // Use composite key: id + sizeId
  getCartKey: (item) => {
    // Use string for MenuItemSizeId to avoid object reference issues
    const sizeId = item.selectedSize && item.selectedSize.MenuItemSizeId ? String(item.selectedSize.MenuItemSizeId) : '';
    return `${item.id}_${sizeId}`;
  },
  addToCart: (item, quantity = 1) => {
    const cart = cartService.getCart();
  const key = cartService.getCartKey(item);
  const existingItem = cart.find((cartItem) => cartService.getCartKey(cartItem) === key);
    if (existingItem) existingItem.quantity = (existingItem.quantity || 1) + quantity;
    else cart.push({ ...item, quantity });
    const payload = JSON.stringify(cart);
    localStorage.setItem("restaurant-cart", payload);
    sessionStorage.setItem("restaurant-cart", payload);
    return cart;
  },
  updateQuantity: (itemId, quantity, sizeId) => {
    const cart = cartService.getCart();
    const key = sizeId ? `${itemId}_${sizeId}` : `${itemId}`;
    const itemIndex = cart.findIndex((item) => cartService.getCartKey(item) === key);
    if (itemIndex !== -1) {
      if (quantity <= 0) cart.splice(itemIndex, 1);
      else cart[itemIndex].quantity = quantity;
    }
    const payload = JSON.stringify(cart);
    localStorage.setItem("restaurant-cart", payload);
    sessionStorage.setItem("restaurant-cart", payload);
    return cart;
  },
  removeFromCart: (itemId, sizeId) => {
    const cart = cartService.getCart();
    const key = sizeId ? `${itemId}_${sizeId}` : `${itemId}`;
    const updatedCart = cart.filter((item) => cartService.getCartKey(item) !== key);
    const payload = JSON.stringify(updatedCart);
    localStorage.setItem("restaurant-cart", payload);
    sessionStorage.setItem("restaurant-cart", payload);
    return updatedCart;
  },
  // Update the selected size for a cart item. If a different cart entry
  // already exists with the new size, merge quantities and remove the old entry.
  updateItemSize: (itemId, oldSizeId, newSelectedSize) => {
    const cart = cartService.getCart();
    const oldKey = oldSizeId ? `${itemId}_${oldSizeId}` : `${itemId}`;
    const newSizeId = newSelectedSize && newSelectedSize.MenuItemSizeId ? String(newSelectedSize.MenuItemSizeId) : '';
    const newKey = `${itemId}_${newSizeId}`;

    const oldIndex = cart.findIndex((c) => cartService.getCartKey(c) === oldKey);
    if (oldIndex === -1) return cart;

    const targetIndex = cart.findIndex((c) => cartService.getCartKey(c) === newKey);

    // If target exists, merge quantities
    if (targetIndex !== -1 && targetIndex !== oldIndex) {
      cart[targetIndex].quantity = (cart[targetIndex].quantity || 0) + (cart[oldIndex].quantity || 0);
      // remove old entry
      cart.splice(oldIndex, 1);
    } else {
      // update the existing entry in-place
      const existing = cart[oldIndex];
      existing.selectedSize = newSelectedSize;
      if (newSelectedSize && newSelectedSize.Price) {
        existing.price = parseFloat(newSelectedSize.Price);
      }
      // also update menuItemSizeId for backward compatibility
      existing.menuItemSizeId = newSelectedSize?.MenuItemSizeId || null;
    }

    const payload = JSON.stringify(cart);
    localStorage.setItem("restaurant-cart", payload);
    sessionStorage.setItem("restaurant-cart", payload);
    return cart;
  },
  clearCart: () => {
    localStorage.removeItem("restaurant-cart");
    sessionStorage.removeItem("restaurant-cart");
    return [];
  },
  getCartTotal: () => {
    const cart = cartService.getCart();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getCartItemsCount: () => {
    const cart = cartService.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
};
// let cart = [];

// export const cartService = {
//   getCart: () => cart,
//   addToCart: (item, quantity = 1) => {
//     const existingItem = cart.find((cartItem) => cartItem.id === item.id);
//     if (existingItem) existingItem.quantity += quantity;
//     else cart.push({ ...item, quantity });
//     return cart;
//   },
//   updateQuantity: (itemId, quantity) => {
//     const itemIndex = cart.findIndex((item) => item.id === itemId);
//     if (itemIndex !== -1) {
//       if (quantity <= 0) cart.splice(itemIndex, 1);
//       else cart[itemIndex].quantity = quantity;
//     }
//     return cart;
//   },
//   removeFromCart: (itemId) => {
//     cart = cart.filter((item) => item.id !== itemId);
//     return cart;
//   },
//   clearCart: () => {
//     cart = [];
//     return cart;
//   },
//   getCartTotal: () => {
//     return cart.reduce((total, item) => total + item.price * item.quantity, 0);
//   },
//   getCartItemsCount: () => {
//     return cart.reduce((count, item) => count + item.quantity, 0);
//   },
// };
