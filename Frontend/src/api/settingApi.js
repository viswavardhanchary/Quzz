import api from './baseApi';

export const getSettings = async (id) => {
  try {
    const response = await api.get(`/setting/${id}`);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}


export const addSettings = async (data) => {
  try {
    const response = await api.post(`/setting/add`, data);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const updateSettings = async (data, id) => {
  try {
    const response = await api.put(`/setting/update/${id}`, data);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const removeSettings = async (id) => {
  try {
    const response = await api.delete(`/setting/delete/${id}`);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}