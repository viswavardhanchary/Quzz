import api from './baseApi';

export const getQuizz = async (id) => {
  try {
    const response = await api.get(`/quizz/${id}`);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const getQuizzList = async (id) => {
  try {
    const response = await api.get(`/quizz/list/${id}`);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const addQuizz = async (data) => {
  try {
    const response = await api.post(`/quizz/add`, data);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const updateQuizz = async (data, id) => {
  try {
    const response = await api.put(`/quizz/update/${id}`, data);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const updateOneQuizz = async (id , field , data) => {
  try {
    const response = await api.put(`/quizz/updateOne/${field}/${id}`, {text : data});
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}

export const removeQuizz = async (id) => {
  try {
    const response = await api.delete(`/quizz/delete/${id}`);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
}