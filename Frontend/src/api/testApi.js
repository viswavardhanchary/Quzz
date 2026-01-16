import api from './baseApi';

export const getTest = async (id) => {
  try {
    const response = await api.get(`/test/get/${id}`);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const getTestList = async (id) => {
  try {
    const response = await api.get(`/test/get/list/${id}`);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const addTest = async (data) => {
  try {
    const response = await api.post(`/test/submit`, data);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}