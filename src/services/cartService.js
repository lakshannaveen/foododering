export const cartService = {
  getCart: () => {
    const cart = localStorage.getItem("restaurant-cart");
    return cart ? JSON.parse(cart) : [];
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
    localStorage.setItem("restaurant-cart", JSON.stringify(cart));
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
    localStorage.setItem("restaurant-cart", JSON.stringify(cart));
    return cart;
  },
  removeFromCart: (itemId, sizeId) => {
    const cart = cartService.getCart();
    const key = sizeId ? `${itemId}_${sizeId}` : `${itemId}`;
    const updatedCart = cart.filter((item) => cartService.getCartKey(item) !== key);
    localStorage.setItem("restaurant-cart", JSON.stringify(updatedCart));
    return updatedCart;
  },
  clearCart: () => {
    localStorage.removeItem("restaurant-cart");
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
