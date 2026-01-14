import { useEffect, useState } from "react";
import { validateUser } from "../api/reCalls";
import { toast } from 'react-toastify'
import { Link, useOutletContext } from "react-router-dom";
import LoginPopUp from "../components/LoginPopUp";
import ListQuizz from "../components/ListQuizz";
import { Download, FolderUp, X } from "lucide-react";
import Loader from "../components/Loader";
import { uploadFile } from "../api/fileApi";
import { useNavigate } from "react-router-dom";
import { makeData } from "../api/reCalls";
export default function CreateQuzz() {
  // console.log(setIsStop)
  const {isStop , setIsStop} = useOutletContext()
  const navigate = useNavigate();
  const defaultLoading = {
    file: false,
    data: false,
  }
  const defaultPopUp = {
    login : false,
    upload: false,
    delete: {
      index: undefined,
      status: false
    },
  }
  const [isPopUpOpen , setIsPopUpOpen] = useState(defaultPopUp);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [fileDetails, setFileDetails] = useState({
    file: undefined,
  });
  useEffect(() => {
    async function check() {
      const ans = await validateUser();
      if (ans === false) {
        toast.error("Plz Login To Use!")
        setIsPopUpOpen({...defaultPopUp , login: true});
      } else {
        setIsPopUpOpen({...defaultPopUp , login: false});
      }
    }
    check();
  }, []);

  const handleUploadFile = async (e) => {
    setIsStop(false);
    setIsLoading({ ...defaultLoading, file: true });
    setFileDetails((prev) => ({
      file: e.target.files[0],
    }));
    setIsPopUpOpen({...defaultPopUp , upload: false});
    const result = await uploadFile(localStorage.getItem('id'), e.target.files[0]);
    if (result.data) {
      toast.success(result.message);
      const sendData = makeData(result.data);
      localStorage.setItem('urlDataManual' , JSON.stringify(sendData));
      navigate("/create/manual");
    } else {
      toast.error(`File is Corrupted | Formatting Isuess File: ${e.target.files[0].name}Only .xls or .xlsx Allowed ` , {
        autoClose: 4000
      });
    }
    setFileDetails((prev) => ({
      file: undefined
    }));
    setIsLoading({ ...defaultLoading, file: false });
  }

  const handleMoveManual = () => {
    const edit = JSON.parse(localStorage.getItem('edit'));
    if(edit) {
      localStorage.removeItem('urlDataManual');
      localStorage.removeItem('edit');
    }
  }

  return (
    <>
      {
        !isPopUpOpen.login &&
        <>
          <div className={`text-white p-2 w-full pt-5 relative ${isPopUpOpen.upload ? "opacity-50" : ""}`}>
            <div className="flex flex-col items-start gap-2 w-full">
              <div className="flex flex-col items-center w-full gap-1">
                <h1 className="text-3xl text-[#ff9100] text-center w-full">Create Quizze, Both Protected and Un Protected</h1>
                <div className="border border-white w-[30%]"></div>
              </div>

              <div className="flex flex-row items-center w-full justify-between">
                <Link to="/create/manual" onClick={handleMoveManual}className="w-max p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer grow-none">Create Manually</Link>

                <div className="flex items-center gap-2 p-1">
                  <a href="./Files/quiz_template.xlsx" className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9]" download="quiz_template.xlsx">
                    <span className="hidden sm:flex">Download Template</span>
                    <span className="flex sm:hidden" title="Download Template"><Download size={22} /></span>
                  </a>
                  <label className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9]" onClick={()=>{setIsPopUpOpen({...defaultPopUp , upload: true});setIsStop(true)}}>
                    <span className="flex items-center gap-1"><p className="" title="Upload Excel file"><FolderUp size={20} /></p><span>Upload File</span></span>
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
            <ListQuizz defaultPopUp={defaultPopUp} isPopUpOpen={isPopUpOpen} setIsPopUpOpen={setIsPopUpOpen}/>
          </div>
          {isPopUpOpen.upload && <div className="absolute z-10 top-50 flex items-center justify-center w-full">
            <div className="">
              <div className="flex items-start flex-col gap-1 max-w-90 text-white p-1 border rounded-md px-2 bg-[#0B1020]">
                <div className="flex items-center justify-between w-full border-b">
                  <span className="text-orange-600 text-lg">Suggestion</span>
                  <span className="cursor-pointer" onClick={()=>{setIsPopUpOpen({...defaultPopUp , upload: false});setIsStop(false)}}><X size={20} /></span>
                </div>
                <div className="py-3">We Recommend to Use our Excel Template, to Avoid Formatting Issues, And Then Modify it. <a href="./Files/quiz_template.xlsx" className=" cursor-pointer transition bfont-semibold text-[#5063f0] hover:text-[#2840d9] underline" download="quiz_template.xlsx">
                  Download Template
                </a> Only (.xlsx and .xls) Files are supported
                </div>
                <div className="flex items-center justify-between w-full">
                  <button className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#838186] text-white hover:bg-[#8d8d8e]" onClick={()=>{setIsPopUpOpen({...defaultPopUp , upload: false});setIsStop(false)}}>Cancel</button>
                    <label className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#0c770a] text-white hover:bg-[#1f672d]">
                    <span className="flex items-center gap-1">Continue</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleUploadFile(e)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>}
        </>
      }
      {
        isPopUpOpen.login && <LoginPopUp />
      }

    </>
  )
}