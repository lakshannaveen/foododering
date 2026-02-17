import {
  GET_SUBCATEGORIES_REQUEST,
  GET_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORIES_FAIL,
  ADD_SUBCATEGORY_REQUEST,
  ADD_SUBCATEGORY_SUCCESS,
  ADD_SUBCATEGORY_FAIL,
  INACTIVATE_SUBCATEGORY_REQUEST,
  INACTIVATE_SUBCATEGORY_SUCCESS,
  INACTIVATE_SUBCATEGORY_FAIL,
} from "../constants/subcategoryConstants";

const initialState = {
  loading: false,
  subcategories: [],
  error: null,
};

export const subcategoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SUBCATEGORIES_REQUEST:
    case ADD_SUBCATEGORY_REQUEST:
    case INACTIVATE_SUBCATEGORY_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_SUBCATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        subcategories: action.payload || [],
      };

    case ADD_SUBCATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        subcategories: [...state.subcategories, action.payload],
      };

    case INACTIVATE_SUBCATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        subcategories: state.subcategories.map((sub) =>
          sub.SubCategoryId === action.payload.SubCategoryId
            ? { ...sub, Status: action.payload.Status }
            : sub
        ),
      };

    case GET_SUBCATEGORIES_FAIL:
    case ADD_SUBCATEGORY_FAIL:
    case INACTIVATE_SUBCATEGORY_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
