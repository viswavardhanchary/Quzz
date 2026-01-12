import api from './baseApi';

export const uploadFile = async (id , data) => {
  try {
    const formData = new FormData();
    formData.append("quizFile", data);
    const response = await api.post(`/file/upload/${id}` , formData , {
      headers: {
        "Content-Type": 'multipart/form-data'
      }
    });
    return response.data;
  }catch (err) {
    return err.response.data;
  }
}