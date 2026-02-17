import {
  GET_TABLES_REQUEST,
  GET_TABLES_SUCCESS,
  GET_TABLES_FAIL,
  ADD_TABLE_REQUEST,
  ADD_TABLE_SUCCESS,
  ADD_TABLE_FAIL,
  UPDATE_TABLE_REQUEST,
  UPDATE_TABLE_SUCCESS,
  UPDATE_TABLE_FAIL,
} from "../constants/tableConstants";

const initialState = {
  tables: [],
  loading: false,
  error: null,
  adding: false,
  updating: false,
};

export const tableReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TABLES_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_TABLES_SUCCESS:
      return { ...state, loading: false, tables: action.payload };
    case GET_TABLES_FAIL:
      return { ...state, loading: false, error: action.payload };

    case ADD_TABLE_REQUEST:
      return { ...state, adding: true, error: null };
    case ADD_TABLE_SUCCESS:
      return {
        ...state,
        adding: false,
        tables: [...state.tables, ...(action.payload || [])],
      };
    case ADD_TABLE_FAIL:
      return { ...state, adding: false, error: action.payload };

    case UPDATE_TABLE_REQUEST:
      return { ...state, updating: true, error: null };
    case UPDATE_TABLE_SUCCESS:
      return {
        ...state,
        updating: false,
        tables: state.tables.map((table) =>
          table.TableId === action.payload.tableId
            ? { ...table, ...action.payload.updatedTable[0] } // merge updated data
            : table
        ),
      };
    case UPDATE_TABLE_FAIL:
      return { ...state, updating: false, error: action.payload };

    default:
      return state;
  }
};
