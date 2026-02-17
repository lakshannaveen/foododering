import {
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_STATUS_UPDATE,
  ORDER_FILTERS_UPDATE,
  ORDER_SEARCH_UPDATE,
  ORDER_RESET_FILTERS,
} from "../constants/orderConstants";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  filters: {
    status: "",
    orderStatus: "",
    dateFrom: "",
    dateTo: "",
    tableNumber: "",
  },
  searchQuery: "",
};

export const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case ORDER_LIST_REQUEST:
      return { ...state, loading: true };
    case ORDER_LIST_SUCCESS:
      return { ...state, loading: false, orders: action.payload };
    case ORDER_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };

    case ORDER_STATUS_UPDATE:
      return { ...state, orders: action.payload };

    case ORDER_FILTERS_UPDATE:
      return { ...state, filters: action.payload };

    case ORDER_SEARCH_UPDATE:
      return { ...state, searchQuery: action.payload };

    case ORDER_RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
        searchQuery: "",
      };

    default:
      return state;
  }
};
