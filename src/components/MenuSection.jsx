
// import React, { useEffect, useState } from "react";
// import { Plus, Clock, Utensils } from "lucide-react";
// import { menuService } from "../services/menu_user";
// import api from "../index";

// const MenuSection = ({ category, onAddToCart, onItemClick }) => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [imageErrors, setImageErrors] = useState({});

//   const formatPrice = (price) =>
//     new Intl.NumberFormat("en-LK", {
//       style: "currency",
//       currency: "LKR",
//       minimumFractionDigits: 0,
//     })
//       .format(price)
//       .replace("LKR", "Rs.");

//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return "";
//     if (/^https?:\/\//i.test(imagePath)) return imagePath;
//     return `${api.defaults.baseURL}${
//       imagePath.startsWith("/") ? "" : "/"
//     }${imagePath}`;
//   };

//   const handleImageError = (itemId) => {
//     setImageErrors((prev) => ({ ...prev, [itemId]: true }));
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "A":
//         return "text-green-600 bg-green-50";
//       case "I":
//         return "text-red-600 bg-red-50";
//       default:
//         return "text-gray-600 bg-gray-50";
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status) {
//       case "A":
//         return "Available";
//       case "I":
//         return "Unavailable";
//       default:
//         return "Unknown";
//     }
//   };

//   const getPriceRange = (sizes) => {
//     if (!sizes || sizes.length === 0) return { min: 0, max: 0, single: 0 };

//     const prices = sizes.map((size) => parseFloat(size.Price));
//     const min = Math.min(...prices);
//     const max = Math.max(...prices);

//     return {
//       min,
//       max,
//       single: prices.length === 1 ? prices[0] : null,
//     };
//   };

//   useEffect(() => {
//     const fetchItems = async () => {
//       setLoading(true);
//       try {
//         const allItems = await menuService.getMenuItemsFromLocalStorage();

//         const mappedItems = allItems.map((item) => ({
//           id: item.MenuItemId,
//           name: item.MenuItemName || item.Name,
//           description: item.Description,
//           image: item.ImageUrl || "",
//           SubCategoryId: item.SubCategoryId,
//           SubName: item.SubName,
//           Status: item.Status,
//           sizes: item.Sizes || [],
//           originalPrice: item.Price ? Number(item.Price) : 0,
//         }));

//         const filtered = mappedItems.filter(
//           (item) => String(item.SubCategoryId) === String(category.id)
//         );

//         setItems(filtered);
//       } catch (error) {
//         console.error("❌ Error fetching menu items:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchItems();
//   }, [category.id]);

//   if (loading) {
//     return (
//       <section className="mb-12 sm:mb-16" id={category.id}>
//         <div className="flex flex-col justify-center items-center py-12 sm:py-16">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#18749b]"></div>
//             <div className="absolute inset-0 h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 rounded-full"></div>
//           </div>
//           <p className="mt-4 text-base sm:text-lg text-gray-600 font-medium">
//             Loading delicious options...
//           </p>
//         </div>
//       </section>
//     );
//   }

//   if (items.length === 0) return null;

//   return (
//     <section className="mb-12 sm:mb-16" id={category.id}>
//       <div className="mb-6 sm:mb-8 lg:mb-10 text-center px-2">
        
//       </div>

//       {/* Fixed Mobile Grid: 2 columns on mobile, scales up on larger screens */}
//       <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 px-2">
//         {items.map((item) => {
//           const isInactive = item.Status === "I";
//           const priceRange = getPriceRange(item.sizes);

//           return (
//             <div
//               key={item.id}
//               className={`group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 hover:border-[#18749b]/50 ${
//                 isInactive ? "opacity-90" : ""
//               }`}
//               onClick={() => onItemClick(item)}
//             >
//               <div className="relative overflow-hidden">
//                 {!imageErrors[item.id] && item.image ? (
//                   <img
//                     src={getImageUrl(item.image)}
//                     alt={item.name}
//                     loading="lazy"
//                     className="w-full h-32 sm:h-40 md:h-44 lg:h-48 object-cover transition-all duration-500 group-hover:scale-105"
//                     onError={() => handleImageError(item.id)}
//                   />
//                 ) : (
//                   <div className="w-full h-32 sm:h-40 md:h-44 lg:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
//                     <div className="text-center">
//                       <Utensils className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#18749b] opacity-40 mx-auto mb-2 group-hover:opacity-60 transition-opacity duration-300" />
//                       <p className="text-[#18749b] text-xs sm:text-sm font-medium opacity-60">
//                         No image available
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Status Badge */}
//                 <div
//                   className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-sm ${getStatusColor(
//                     item.Status
//                   )}`}
//                 >
//                   {getStatusText(item.Status)}
//                 </div>

//                 {/* Inactive Overlay */}
//                 {isInactive && (
//                   <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center backdrop-blur-sm">
//                     <div className="bg-white bg-opacity-95 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg">
//                       <span className="text-red-600 font-semibold text-xs sm:text-sm flex items-center gap-1">
//                         <Clock size={12} className="sm:w-4 sm:h-4" />
//                         <span>Unavailable</span>
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="p-3 sm:p-4 lg:p-5">
//                 <div className="flex items-start justify-between mb-2 sm:mb-3">
//                   <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-tight group-hover:text-[#18749b] transition-colors duration-200 line-clamp-2 flex-1 pr-2">
//                     {item.name}
//                   </h3>
//                   {item.SubName && (
//                     <span className="text-xs bg-[#18749b]/10 text-[#18749b] px-2 py-1 rounded-full font-medium flex-shrink-0 hidden sm:inline">
//                       {item.SubName}
//                     </span>
//                   )}
//                 </div>

//                 <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-xs sm:text-sm">
//                   {item.description ||
//                     "Delicious menu item prepared with care and quality ingredients."}
//                 </p>

//                 <div className="flex items-center justify-between mb-3 sm:mb-4">
//                   <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
//                     <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
//                     <span>15-20 min</span>
//                   </div>
//                   <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
//                     <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
//                     <span>Fresh</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="flex flex-col">
//                     {/* Price Display - Show range or single price */}
//                     {item.sizes && item.sizes.length > 0 ? (
//                       priceRange.single !== null ? (
//                         <span className="text-base sm:text-lg lg:text-xl font-bold text-[#18749b] tracking-tight">
//                           {formatPrice(priceRange.single)}
//                         </span>
//                       ) : (
//                         <span className="text-base sm:text-lg lg:text-xl font-bold text-[#18749b] tracking-tight">
//                           {formatPrice(priceRange.min)} -{" "}
//                           {formatPrice(priceRange.max)}
//                         </span>
//                       )
//                     ) : (
//                       <span className="text-base sm:text-lg lg:text-xl font-bold text-[#18749b] tracking-tight">
//                         {formatPrice(item.originalPrice)}
//                       </span>
//                     )}
                   
//                   </div>

//                   <button
//                     className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full font-medium transition-all duration-200 transform text-xs sm:text-sm ${
//                       isInactive
//                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                         : "bg-gradient-to-r from-[#18749b] to-[#1e5a7a] hover:from-[#1e5a7a] hover:to-[#18749b] text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
//                     }`}
//                     disabled={isInactive}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (!isInactive) {
//                         // If item has multiple sizes, open modal for selection
//                         if (item.sizes && item.sizes.length > 1) {
//                           onItemClick(item);
//                         } else {
//                           // Single size or no sizes, add directly to cart
//                           onAddToCart(item);
//                         }
//                       }
//                     }}
//                   >
//                     {isInactive ? (
//                       <>
//                         <Clock size={12} className="sm:w-4 sm:h-4" />
//                         <span className="sm:inline">Unavailable</span>
//                       </>
//                     ) : (
//                       <>
//                         <Plus size={12} className="sm:w-4 sm:h-4" />
//                         <span className="sm:inline">Add</span>
                        
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// };

// export default MenuSection;