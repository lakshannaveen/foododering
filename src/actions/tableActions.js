import { toast } from "react-toastify";
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

import { getAllTables, addTable, updateTable } from "../services/tableService";

// Fetch all tables
export const fetchTables = () => async (dispatch) => {
  try {
    dispatch({ type: GET_TABLES_REQUEST });

    const data = await getAllTables();

    if (data.StatusCode === 200) {
      dispatch({
        type: GET_TABLES_SUCCESS,
        payload: data.ResultSet || [],
      });
    } else {
      toast.error(data.Result || "Failed to fetch tables");
      dispatch({
        type: GET_TABLES_FAIL,
        payload: data.Result || "Failed to fetch tables",
      });
    }
  } catch (error) {
    toast.error(error.message || "Failed to fetch tables");
    dispatch({
      type: GET_TABLES_FAIL,
      payload: error.message || "Failed to fetch tables",
    });
  }
};

// Add new table
export const createTable = (tableData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_TABLE_REQUEST });

    const data = await addTable(tableData);

    if (data.StatusCode === 200) {
      toast.success(data.Result || "Table added successfully");
      dispatch({
        type: ADD_TABLE_SUCCESS,
        payload: data.ResultSet, // new table
      });
    } else {
      toast.error(data.Result || "Failed to add table");
      dispatch({
        type: ADD_TABLE_FAIL,
        payload: data.Result || "Failed to add table",
      });
    }
  } catch (error) {
    toast.error(error.message || "Failed to add table");
    dispatch({
      type: ADD_TABLE_FAIL,
      payload: error.message || "Failed to add table",
    });
  }
};

// Update table
export const editTable = (tableId, tableData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_TABLE_REQUEST });

    const data = await updateTable(tableId, tableData);

    if (data.StatusCode === 200) {
      toast.success(data.Result || "Table updated successfully");
      dispatch({
        type: UPDATE_TABLE_SUCCESS,
        payload: { tableId, updatedTable: data.ResultSet },
      });
    } else {
      toast.error(data.Result || "Failed to update table");
      dispatch({
        type: UPDATE_TABLE_FAIL,
        payload: data.Result || "Failed to update table",
      });
    }
  } catch (error) {
    toast.error(error.message || "Failed to update table");
    dispatch({
      type: UPDATE_TABLE_FAIL,
      payload: error.message || "Failed to update table",
    });
  }
};
