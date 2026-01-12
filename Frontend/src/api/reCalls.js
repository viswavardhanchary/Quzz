import { verifyUserID } from "../api/userApi";

export const verifyID = async (id) => {
  try {
    const response = await verifyUserID(id);
    if (response.id) {
      return {
        status: true,
        message: response.message
      }
    } else {
      return {
        status: false,
        message: response.message
      }
    }
  } catch (err) {
    return {
      status: false,
      message: response.message
    }

  }
}

export async function validateUser() {
  if (localStorage.getItem('id') === null) {
    return false;
  } else {
    const result = await verifyID(localStorage.getItem('id'));
    if (!result.status) {
      toast.error("Plz Login To Use!")
      return false;
    }
  }
  return true;
}

export function makeData(data) {
    return data.map((cur) => {
        return {
          question: cur.question,
          type: cur.type,
          minQuestion: false,
          minOption: false,
          options: [...cur.options],
          err: {
            status: undefined,
            message: ""
          },
          onCloseError: undefined,
        }
      })
  }