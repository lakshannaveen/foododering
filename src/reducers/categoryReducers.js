// import {
//   GET_CATEGORIES_REQUEST,
//   GET_CATEGORIES_SUCCESS,
//   GET_CATEGORIES_FAIL,
//   ADD_CATEGORY_REQUEST,
//   ADD_CATEGORY_SUCCESS,
//   ADD_CATEGORY_FAIL,
// } from "../constants/categoryConstants";

// const initialState = {
//   loading: false,
//   categories: [],
//   error: null,
// };

// export const categoryReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case GET_CATEGORIES_REQUEST:
//     case ADD_CATEGORY_REQUEST:
//       return { ...state, loading: true, error: null };

//     case GET_CATEGORIES_SUCCESS:
//       return { ...state, loading: false, categories: action.payload };

//     case ADD_CATEGORY_SUCCESS:
//       return {
//         ...state,
//         loading: false,
//         categories: [...state.categories, action.payload],
//       };

//     case GET_CATEGORIES_FAIL:
//     case ADD_CATEGORY_FAIL:
//       return { ...state, loading: false, error: action.payload };

//     default:
//       return state;
//   }
// };
import {
  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAIL,
  ADD_CATEGORY_REQUEST,
  ADD_CATEGORY_SUCCESS,
  ADD_CATEGORY_FAIL,
  GET_CATEGORY_BY_ID_REQUEST,
  GET_CATEGORY_BY_ID_SUCCESS,
  GET_CATEGORY_BY_ID_FAIL,
  INACTIVATE_CATEGORY_REQUEST,
  INACTIVATE_CATEGORY_SUCCESS,
  INACTIVATE_CATEGORY_FAIL,
} from "../constants/categoryConstants";

const initialState = {
  loading: false,
  categories: [],
  category: null, // for single category fetch
  error: null,
};

export const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CATEGORIES_REQUEST:
    case ADD_CATEGORY_REQUEST:
    case GET_CATEGORY_BY_ID_REQUEST:
    case INACTIVATE_CATEGORY_REQUEST:
      return { ...state, loading: true };

    case GET_CATEGORIES_SUCCESS:
      return { ...state, loading: false, categories: action.payload };

    case ADD_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: [...state.categories, action.payload],
      };

    case GET_CATEGORY_BY_ID_SUCCESS:
      return { ...state, loading: false, category: action.payload };

    case INACTIVATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.map((c) =>
          (c.CategoryId || c.id) === (action.payload.CategoryId || action.payload.id)
            ? { ...c, Status: action.payload.Status }
            : c
        ),
      };

    case GET_CATEGORIES_FAIL:
    case ADD_CATEGORY_FAIL:
    case GET_CATEGORY_BY_ID_FAIL:
    case INACTIVATE_CATEGORY_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
