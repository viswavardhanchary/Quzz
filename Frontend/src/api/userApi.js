import api from './baseApi';

export const getUser = async ({id}) => {
  try { 
    const response = await api.get(`/user/${id}`);
    return response.data;
  }catch(err) {
    return err.response.data;
  }
}

export const verifyUser = async (data) => {
  try { 
    const response = await api.post(`/user/verify` , data);
    // if(response.data.id) {
    //   console.log(response.data.id);
    // }else { 
    //   console.log(response.data.message);
    // }
    return response.data;
  }catch(err) {
    // console.log(err.response.data.message);
    return err.response.data;
  }
}

export const verifyUserID = async (id) => {
  try { 
    const response = await api.get(`/user/verifyId/${id}`);
    // if(response.data.id) {
    //   console.log(response.data.id);
    // }else { 
    //   console.log(response.data.message);
    // }
    return response.data;
  }catch(err) {
    // console.log(err.response.data.message);
    return err.response.data;
  }
}

export const addUser = async (data) => {
  try { 
    const response = await api.post(`/user/add` , data);
    // if(response.data.id) {
    //   console.log(response.data.id);
    // }else { 
    //   console.log(response.data.message);
    // }
    return response.data;
  }catch(err) {
    //console.log(err.response.data.message);
    return err.response.data;
  }
}

export const updateUser = async (data ,id) => {
  try { 
    const response = await api.put(`/user/update/${id}` , data);
    // if(response.data.id) {
    //   console.log(response.data.id);
    // }else { 
    //   console.log(response.data.message);
    // }
    return response.data;
  }catch(err) {
    // console.log(err.response.data.message);
    return err.response.data;
  }
}

export const removeUser = async (id) => {
  try { 
    const response = await api.delete(`/user/delete/${id}`);
    // if(response.data.id) {
    //   console.log(response.data.id);
    // }else { 
    //   console.log(response.data.message);
    // }
     return response.data;
  }catch(err) {
    // console.log(err.response.data.message);
     return err.response.data;
  }
}