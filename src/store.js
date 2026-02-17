import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./reducers/authReducer";
import { adminReducer } from "./reducers/adminReducers";
import { tableReducer } from "./reducers/tableReducers";
import { categoryReducer } from "./reducers/categoryReducers";
import { subcategoryReducer } from "./reducers/subcategoryReducers";
import { menuReducer } from "./reducers/menuReducer";
import { orderReducer } from "./reducers/orderReducer";


const store = configureStore({
  reducer: {
    auth: authReducer,
    admins: adminReducer,
    table: tableReducer,
    category: categoryReducer,
    subcategory: subcategoryReducer,
    menu: menuReducer,
    order: orderReducer,
    
  },
});

export default store;
