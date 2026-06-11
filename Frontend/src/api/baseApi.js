import axios from 'axios';

const api = new axios.create({
  baseURL : "https://quzz-backend.onrender.com/"
  // baseURL: "http://localhost:3000"
});

export default api;
