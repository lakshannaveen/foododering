// Use same image URL logic as Cart
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('/Images/MenuItems/')) {
      return `https://foodorderingbackend.dockyardsoftware.com${imagePath}`;
    }
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return `https://foodorderingbackend.dockyardsoftware.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Heart,
  TrendingUp,
  Award,
  Eye,
} from "lucide-react";
import Header from "../components/Header";
import ItemModal from "../components/ItemModal";
import Cart from "../components/Cart";
import OrderSuccessModal from "../components/OrderSuccessModal";
import CompleteOrderSuccessModal from "../components/CompleteOrderSuccessModal";
import { sessionManager } from "../utils/sessionManager";
import foodVideo from "../assets/large.mp4";
import { cartService } from "../services/cartService";

const MenuPage = () => {
  const navigate = useNavigate();
  const [menuCategories, setMenuCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  // Track selected size per menu item
  const [selectedSizes, setSelectedSizes] = useState({});
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart side panel state and handlers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Item modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Order success modal state
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  // Complete order success (detailed) state
  const [showCompleteSuccess, setShowCompleteSuccess] = useState(false);
  const [completePayload, setCompletePayload] = useState(null);
  // Payment success modal state (shown when returning from PayPal)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState(null);

  // Called by Cart when order and all items are added successfully
  // Accepts either an orderId (legacy) or a payload { orderId, items, total, tableId, paymentMethod }
  const handleOrderSuccess = (payload) => {
    if (payload && typeof payload === 'object' && payload.orderId) {
      setCompletePayload(payload);
      setShowCompleteSuccess(true);
      return;
    }

    // Legacy numeric id
    setOrderId(payload);
    setShowOrderSuccess(true);
  };

  const handleAddToCart = (item, quantity = 1, selectedSize = null) => {
    let itemToAdd = { ...item };
    if (item.sizes && item.sizes.length > 0) {
      const sizeToUse = selectedSize || item.sizes[0];
      itemToAdd = {
        ...item,
        selectedSize: sizeToUse,
        price: parseFloat(sizeToUse.Price),
        displayName: `${item.name || item.MenuItemName} (${sizeToUse.Size})`,
      };
    } else {
      itemToAdd.price = parseFloat(item.price || item.Price || 0);
    }
    cartService.addToCart(itemToAdd, quantity);
    loadCart();
  };

  // Open item modal
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Close item modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleCartClick = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);
  const handleUpdateQuantity = (itemId, newQuantity, sizeId) => {
    cartService.updateQuantity(itemId, newQuantity, sizeId);
    loadCart();
  };
  const handleRemoveItem = (itemId, sizeId) => {
    cartService.removeFromCart(itemId, sizeId);
    loadCart();
  };
  const handleCartUpdated = () => loadCart();

  useEffect(() => {
    loadCart();
    fetchCategories();
    fetchAllMenuItems();
    // Check if we've just returned from payment and should show success modal
    try {
      const paidId = sessionManager.consumePaymentSuccess();
      if (paidId) {
        // Show the complete order modal (may not have items snapshot available)
        setCompletePayload({ orderId: paidId, items: [], total: null });
        setShowCompleteSuccess(true);
      }
    } catch (err) {
      console.error('Error checking payment success flag:', err);
    }
  }, []);

  // Filter menu items when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      filterMenuItemsByCategory(selectedCategory.id);
      filterSubcategoriesByCategory(selectedCategory.id);
    }
  }, [selectedCategory]);

  // ✅ Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("https://foodorderingbackend.dockyardsoftware.com/Category/GetAllCategory");
      const data = response.data;
      const categoriesArray = data.ResultSet || [];
      const activeCategories = categoriesArray.filter((category) => category.Status === "A");
      const categoriesWithExtras = activeCategories.map((category, index) => ({
        id: category.CategoryId,
        name: category.Name,
        description: category.Description || `Explore our delicious ${category.Name} selection`,
        image: getCategoryImage(category.Name, index),
      }));
      setMenuCategories(categoriesWithExtras);
      // Auto-select first category and filter items for it
      if (categoriesWithExtras.length > 0) {
        const firstCategory = categoriesWithExtras[0];
        setSelectedCategory(firstCategory);
        filterMenuItemsByCategory(firstCategory.id);
        filterSubcategoriesByCategory(firstCategory.id);
      }
    } catch (err) {
      setError(err.message || "Failed to load categories");
      setMenuCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all menu items once on page load
  const fetchAllMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("https://foodorderingbackend.dockyardsoftware.com/Menuitem/GetAllMenuItem");
      const data = response.data;
      const items = Array.isArray(data.ResultSet) ? data.ResultSet : [];
      
      // Filter only active items
      const activeItems = items.filter(item => item.Status === "A");
      
      // Map API fields to frontend fields
      const mappedItems = activeItems.map(item => ({
        id: item.MenuItemId,
        name: item.MenuItemName,
        categoryId: item.CategoryId,
        categoryName: item.CategoryName,
        subCategoryId: item.SubCategoryId,
        subCategoryName: item.SubName || item.SubCategoryName,
        description: item.Description,
        image: item.ImageUrl,
        status: item.Status,
        sizes: item.Sizes || [],
        price: item.Sizes && item.Sizes.length > 0 ? parseFloat(item.Sizes[0].Price) : null,
      }));
      
      setAllMenuItems(mappedItems);
      setMenuItems(mappedItems); // Show all items by default
    } catch (err) {
      setError("Failed to load menu items");
      setMenuItems([]);
      setAllMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items by selected category (frontend filtering)
  const filterMenuItemsByCategory = (categoryId) => {
    const filtered = allMenuItems.filter(item => String(item.categoryId) === String(categoryId));
    setMenuItems(filtered);
    setSelectedSubcategory(null);
  };

  // Filter subcategories by selected category (frontend filtering)
  const filterSubcategoriesByCategory = (categoryId) => {
    const itemsInCategory = allMenuItems.filter(item => String(item.categoryId) === String(categoryId));
    const uniqueSubcategories = Array.from(
      new Map(
        itemsInCategory.map(item => [item.subCategoryId, {
          SubCategoryId: item.subCategoryId,
          Name: item.subCategoryName,
          Status: 'A'
        }])
      ).values()
    );
    setSubcategories(uniqueSubcategories);
  };

  // Handle subcategory filter (frontend filtering)
  const handleSubcategoryFilter = (subCategoryId) => {
    setSelectedSubcategory(subCategoryId);
    if (!subCategoryId) {
      filterMenuItemsByCategory(selectedCategory.id);
    } else {
      const filtered = allMenuItems.filter(
        item => String(item.categoryId) === String(selectedCategory.id) && 
                 String(item.subCategoryId) === String(subCategoryId)
      );
      setMenuItems(filtered);
    }
  };

  // Handle size change for a menu item
  const handleSizeChange = (itemId, sizeId) => {
    setSelectedSizes(prev => ({ ...prev, [itemId]: sizeId }));
  };

  // ✅ Category → Default Image Mapper
  const getCategoryImage = (categoryName, index) => {
    const lowerCaseName = categoryName.toLowerCase();

    const imageMap = {
      srilankan:
        "https://i.pinimg.com/1200x/eb/be/aa/ebbeaa13e288daf36fa0b7906679da65.jpg",
      indian:
        "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400",
      chinese:
        "https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=400",
      italian:
        "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=400",
      japanese:
        "https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=400",
      desserts:
        "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
      drinks:
        "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",
    };

    const defaultImages = [
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=400",
      "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400",
    ];

    return (
      imageMap[lowerCaseName] || defaultImages[index % defaultImages.length]
    );
  };


  // Ref for Our Menu section
  const menuSectionRef = useRef(null);

  // Scroll to Our Menu section
  const scrollToMenuSection = () => {
    if (menuSectionRef.current) {
      menuSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ✅ Cart Logic
  const loadCart = () => {
    const items = cartService.getCart();
    setCartItems(items);
    setCartItemsCount(cartService.getCartItemsCount());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 relative">
      <OrderSuccessModal
        isOpen={showOrderSuccess}
        onClose={() => setShowOrderSuccess(false)}
        prepTime="15-20 min"
        orderId={orderId}
      />
      <CompleteOrderSuccessModal
        isOpen={showCompleteSuccess}
        onClose={() => setShowCompleteSuccess(false)}
        amount={completePayload?.total}
        orderId={completePayload?.orderId}
        totalFoods={completePayload?.items?.length || 0}
        tableNumber={completePayload?.tableId}
        items={completePayload?.items || []}
      />
      <Header
        cartItemsCount={cartItemsCount}
        onCartClick={handleCartClick}
        onMenuToggle={() => {}}
      />
      {/* ========== HERO SECTION ========== */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={foodVideo} type="video/mp4" />
        </video>
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/45 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
        
        {/* Decorative accent circles */}
        <div className="absolute top-10 right-8 w-24 h-24 bg-gradient-to-br from-[#18749b]/20 to-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-4 w-32 h-32 bg-gradient-to-tr from-cyan-500/10 to-[#18749b]/15 rounded-full blur-3xl"></div>
        
        <style>{`
          @keyframes pulse-neon {
            0%, 100% { 
              filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.3)) drop-shadow(0 0 15px rgba(24, 116, 155, 0.2));
            }
            50% { 
              filter: drop-shadow(0 0 12px rgba(0, 217, 255, 0.5)) drop-shadow(0 0 25px rgba(24, 116, 155, 0.3));
            }
          }
          @keyframes slide-in-left {
            0% { transform: translateX(-100px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes slide-in-right {
            0% { transform: translateX(100px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          .neon-text {
            color: #ffffff;
            text-shadow: 
              0 0 8px rgba(0, 217, 255, 0.4),
              0 0 16px rgba(24, 116, 155, 0.25),
              0 4px 8px rgba(0, 0, 0, 0.8);
            animation: pulse-neon 2s ease-in-out infinite;
            letter-spacing: 0.15em;
            font-weight: 900;
          }
          .ocean-text {
            animation: slide-in-left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .breeze-text {
            animation: slide-in-right 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .outline-border {
            position: relative;
            border: 2px solid rgba(0, 217, 255, 0.4);
            padding: 0.5rem 1.5rem;
            background: rgba(255, 255, 255, 0.02);
            box-shadow: 
              inset 0 0 15px rgba(0, 217, 255, 0.08),
              0 0 20px rgba(0, 217, 255, 0.15);
          }
        `}</style>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col items-center justify-center px-3 sm:px-6 lg:px-8">
            
            {/* OCEAN - Top Left */}
            <div className="absolute top-[28%] sm:top-[22%] md:top-[20%] lg:top-[18%] left-0 w-full flex justify-start px-3 sm:px-6">
              <div className="ocean-text group cursor-default">
                <h1 className="neon-text text-[3.5rem] xs:text-[4.5rem] sm:text-8xl md:text-9xl lg:text-[10rem] font-black leading-none"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    textTransform: 'uppercase',
                  }}>
                  OCEAN
                </h1>
              </div>
            </div>

            {/* BREEZE - Bottom Right */}
            <div className="absolute bottom-[28%] sm:bottom-[20%] md:bottom-[18%] lg:bottom-[16%] right-0 w-full flex justify-end px-3 sm:px-6">
              <div className="breeze-text group cursor-default">
                <h1 className="neon-text text-[3.5rem] xs:text-[4.5rem] sm:text-8xl md:text-9xl lg:text-[10rem] font-black leading-none"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    textTransform: 'uppercase',
                  }}>
                  BREEZE
                </h1>
              </div>
            </div>

            {/* Center decorative element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-1 h-20 bg-gradient-to-b from-transparent via-[#18749b]/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <Cart
        isOpen={isCartOpen}
        onClose={handleCartClose}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCartUpdated={handleCartUpdated}
        onOrderSuccess={handleOrderSuccess}
      />
      <ItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />
  {/* ========== OUR MENU SECTION ========== */}
  <section ref={menuSectionRef} className="relative min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-16 sm:py-20 lg:py-24">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(24, 116, 155) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#18749b]/10 to-teal-500/10 backdrop-blur-sm text-[#18749b] px-4 py-2 rounded-full mb-4 border border-[#18749b]/20">
              <ChefHat className="w-4 h-4" />
              <span className="text-sm font-semibold">Curated Selection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-[#18749b] to-gray-900 bg-clip-text text-transparent mb-3 sm:mb-4">
              Our Menu
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Explore our diverse culinary offerings from around the world, each
              prepared with authentic recipes and the freshest ingredients.
            </p>
          </div>


          {/* Categories Subsection */}
          <div className="mb-8 sm:mb-10">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border border-[#18749b]"></div>
                <span className="ml-3 text-sm text-gray-600">
                  Loading...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-10 px-4">
                <p className="text-red-600 mb-4 text-sm">
                  Error: {error}
                </p>
                <button
                  onClick={fetchCategories}
                  className="px-6 py-2.5 bg-[#18749b] text-white rounded-lg hover:bg-[#156285] transition-colors text-sm font-semibold shadow-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5 mb-10 ">
                  {menuCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className={`group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${selectedCategory && selectedCategory.id === category.id ? 'border border-[#18749b]' : 'border border-gray-100 hover:border-[#18749b]/30'}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <div className="relative h-24 sm:h-28 md:h-32 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400";
                          }}
                        />

                      </div>
                      {selectedCategory && selectedCategory.id === category.id ? (
                        <div className="w-full p-5 transition-all duration-200 shadow-md hover:shadow-lg border-[#18749b] bg-gradient-to-r from-[#18749b]/10 to-teal-500/10 shadow-lg">
                          <h3 className="text-xs sm:text-sm font-bold leading-tight transition-colors duration-300 text-center">
                            {category.name}
                          </h3>
                        </div>
                      ) : (
                        <div className="w-full p-5 transition-all duration-200">
                          <h3 className="text-xs sm:text-sm font-bold leading-tight transition-colors duration-300 text-center">
                            {category.name}
                          </h3>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Menu Items Grid */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#18749b] to-teal-600 bg-clip-text text-transparent mb-2">
                Menu Items
              </h3>
              <div className="w-20 h-1 bg-gradient-to-r from-[#18749b] to-teal-600 mx-auto rounded-full"></div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18749b]"></div>
                <span className="ml-3 text-sm text-gray-600">Loading menu items...</span>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center text-gray-500 py-10 text-base">No menu items found for this category.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {menuItems.map((item) => {
                  // Determine selected size for this item
                  const selectedSizeId = selectedSizes[item.id] || (item.sizes && item.sizes[0]?.MenuItemSizeId);
                  const selectedSize = item.sizes ? item.sizes.find(s => s.MenuItemSizeId === selectedSizeId) : null;
                  return (
                    <div
                      key={item.id}
                      className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#18749b]/30 flex flex-row md:flex-col overflow-hidden transform"
                      onClick={() => handleItemClick(item)}
                    >
                      {/* Image Section */}
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(item.image) || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'; }}
                        />
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-4 text-left">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2">
                            <h4 className="font-semibold text-base">{item.name}</h4>
                            {item.subCategoryName && (
                              <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 mt-1 text-xs">
                                {item.subCategoryName}
                              </span>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          {/* Format prices to include 'Rs.' and use commas for thousands */}
                          <span className="text-lg font-bold text-accent">
                            {item.sizes && item.sizes.length > 0
                              ? (() => {
                                  const prices = item.sizes.map(s => parseFloat(s.Price));
                                  const min = Math.min(...prices);
                                  const max = Math.max(...prices);
                                  return min === max
                                    ? `Rs. ${min.toLocaleString()}`
                                    : `Rs. ${min.toLocaleString()} - ${max.toLocaleString()}`;
                                })()
                              : (item.price ? `Rs. ${parseFloat(item.price).toLocaleString()}` : 'N/A')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default MenuPage;
