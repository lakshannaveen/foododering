import api from "../index";

const getAllLabor = async () => {
  try {
    const res = await api.get("/Labor/GetAllLabor");
    // backend may return ResultSet or an array
    const list = Array.isArray(res?.data?.ResultSet)
      ? res.data.ResultSet
      : Array.isArray(res?.data)
      ? res.data
      : [];
    return list;
  } catch (err) {
    console.error("Failed to fetch labors:", err);
    return [];
  }
};

const addLabor = async ({ role, costType, rate, laborName }) => {
  try {
    const res = await api.post(
      "/Labor/AddLabor",
      null,
      {
        params: {
          Role: role,
          CostType: costType,
          Rate: rate,
          LaborName: laborName,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to add labor:", err);
    throw err;
  }
};

const updateLabor = async ({ laborId, laborName, role, costType, rate }) => {
  try {
    const res = await api.post(
      "/Labor/UpdateLabor",
      null,
      {
        params: {
          LaborId: laborId,
          LaborName: laborName,
          Role: role,
          CostType: costType,
          Rate: rate,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to update labor:", err);
    throw err;
  }
};

const updateLaborStatus = async (LaborId, Status) => {
  try {
    const res = await api.post(`/Labor/UpdateLaborStatus?LaborId=${encodeURIComponent(LaborId)}&Status=${encodeURIComponent(Status)}`);
    return res.data;
  } catch (err) {
    console.error('Failed to update labor status:', err);
    throw err;
  }
};

export default {
  getAllLabor,
  addLabor,
  updateLabor,
  updateLaborStatus,
};
