import api from "../index";

const getAllOverhead = async () => {
  try {
    const res = await api.get("/OverHead/GetAllOverhead");
    // backend may return ResultSet or an array
    const list = Array.isArray(res?.data?.ResultSet)
      ? res.data.ResultSet
      : Array.isArray(res?.data)
      ? res.data
      : [];
    return list;
  } catch (err) {
    console.error("Failed to fetch overheads:", err);
    return [];
  }
};

const addOverhead = async ({ overheadName, costPerHour }) => {
  try {
    const res = await api.post(
      "/OverHead/AddOverhead",
      null,
      {
        params: {
          OverheadName: overheadName,
          CostPerHour: costPerHour,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to add overhead:", err);
    throw err;
  }
};

const updateOverhead = async ({ overheadId, overheadName, costPerHour }) => {
  try {
    const res = await api.post(
      "/OverHead/UpdateOverhead",
      null,
      {
        params: {
          OverheadId: overheadId,
          OverheadName: overheadName,
          CostPerHour: costPerHour,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to update overhead:", err);
    throw err;
  }
};

const updateOverheadStatus = async (OverheadId, Status) => {
  try {
    const res = await api.post(`/OverHead/UpdateOverheadStatus?OverheadId=${encodeURIComponent(OverheadId)}&Status=${encodeURIComponent(Status)}`);
    return res.data;
  } catch (err) {
    console.error('Failed to update overhead status:', err);
    throw err;
  }
};

const removeOverhead = async (Status, OverheadId) => {
  try {
    const res = await api.post(`/OverHead/UpdateStatusOverHead?Status=${encodeURIComponent(Status)}&OverheadId=${encodeURIComponent(OverheadId)}`);
    return res.data;
  } catch (err) {
    console.error('Failed to remove overhead:', err);
    throw err;
  }
};

export default {
  getAllOverhead,
  addOverhead,
  updateOverhead,
  updateOverheadStatus,
  removeOverhead,
};
