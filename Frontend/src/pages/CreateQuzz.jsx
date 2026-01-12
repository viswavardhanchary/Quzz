import { useEffect, useState } from "react";
import { validateUser } from "../api/reCalls";
import { toast } from 'react-toastify'
import { Link } from "react-router-dom";
import LoginPopUp from "../components/LoginPopUp";
import ListQuizz from "../components/ListQuizz";
import { FolderUp } from "lucide-react";
import Loader from "../components/Loader";
import { uploadFile } from "../api/fileApi";
import { useNavigate } from "react-router-dom";
import { makeData } from "../api/reCalls";
export default function CreateQuzz() {
  const navigate = useNavigate();
  const defaultLoading = {
    file: false,
    data: false,
  }
  const [loginPopUp, setLoginPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [fileDetails, setFileDetails] = useState({
    file: undefined,
  });
  useEffect(() => {
    async function check() {
      const ans = await validateUser();
      if (ans === false) {
        toast.error("Plz Login To Use!")
        setLoginPopUp(true);
      } else {
        setLoginPopUp(false);
      }
    }
    check();
  }, []);

  const handleUploadFile = async (e) => {
    setIsLoading({ ...defaultLoading, file: true });
    setFileDetails((prev) => ({
      file: e.target.files[0],
    }));
    const result = await uploadFile(localStorage.getItem('id'), e.target.files[0]);
    if (result.data) {
      toast.success(result.message);
      const sendData = makeData(result.data);
      navigate("/create/manual", {
        state: sendData
      });
    } else {
      toast.error(result.message, `File is Corrupted | Formatting Isuess\nFile: ${e.target.files[0]}`, {
        autoClose: 4000
      });
      navigate("/create");
    }
    setFileDetails((prev) => ({
      file: undefined
    }));
    setIsLoading({ ...defaultLoading, file: false });
  }
  return (
    <>
      {
        !loginPopUp &&
        <>
        <div className="text-white p-2 w-full pt-5">
          <div className="flex flex-col items-start gap-2 w-full">
            <div className="flex flex-col items-center w-full gap-1">
              <h1 className="text-3xl text-[#ff9100] text-center w-full">Create Quizze, Both Protected and Un Protected</h1>
              <div className="border border-white w-[30%]"></div>
            </div>

            <div className="flex flex-row items-center w-full justify-between">
              <Link to="/create/manual" className="w-max p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer grow-none">Create Manually</Link>
              <div className="flex items-start flex-col gap-1 w-max p-1">
                <label className="flex items-center justify-center ga p-1 w-full cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9]">
                  <span className="flex items-center gap-1"><p className="" title="Upload Excel file"><FolderUp size={20} /></p><span>Upload File</span></span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUploadFile(e)}
                  />
                </label>
              </div>
            </div>
            <div className="flex w-full justify-end">
              <div className="flex items-center gap-1">
                {
                  isLoading.file && <span><Loader type="small" /></span>
                }
                {
                  isLoading.file && <span>Verifiying...</span>
                }
              </div>
            </div>
          </div>
          <ListQuizz />


        </div>
        
        </>
     
      }
      {
        loginPopUp && <LoginPopUp />
      }

    </>
  )
}