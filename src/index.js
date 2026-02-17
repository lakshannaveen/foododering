// services/index.js
import axios from "axios";

const api = axios.create({
  //baseURL: "https://foodorderingbackend.dockyardsoftware.com", // base API URL
  baseURL: "https://foodorderingbackend.dockyardsoftware.com", // base API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
