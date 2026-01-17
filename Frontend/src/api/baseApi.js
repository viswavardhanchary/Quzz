import axios from 'axios';

const api = new axios.create({
  baseURL : "https://quzz-backend.onrender.com/"
});

export default api;
