import { useEffect, useState } from "react";
import { validateUser } from "../api/reCalls";
import { toast } from 'react-toastify';
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import LoginPopUp from "../components/LoginPopUp";
import ListQuizz from "../components/ListQuizz";
import { Download, FolderUp, X, Plus, FileSpreadsheet, AlertCircle } from "lucide-react";
import Loader from "../components/Loader";
import { uploadFile } from "../api/fileApi";
import { makeData } from "../api/reCalls";

export default function CreateQuzz() {
  const { setIsStop } = useOutletContext();
  const navigate = useNavigate();
  
  const defaultLoading = {
    file: false,
    data: false,
  };
  
  const defaultPopUp = {
    login: false,
    upload: false,
    delete: { index: undefined, status: false },
    link: { index: undefined, status: false },
    share: { index: undefined, status: false }
  };

  const [isPopUpOpen, setIsPopUpOpen] = useState(defaultPopUp);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [fileDetails, setFileDetails] = useState({ file: undefined });

  useEffect(() => {
    async function check() {
      const ans = await validateUser();
      if (ans === false) {
        toast.error("Please Login To Use!");
        setIsPopUpOpen({ ...defaultPopUp, login: true });
      } else {
        setIsPopUpOpen({ ...defaultPopUp, login: false });
      }
    }
    check();
  }, []);

  const handleUploadFile = async (e) => {
    setIsStop(false);
    setIsLoading({ ...defaultLoading, file: true });
    setFileDetails({ file: e.target.files[0] });
    setIsPopUpOpen({ ...defaultPopUp, upload: false });
    
    const result = await uploadFile(localStorage.getItem('id'), e.target.files[0]);
    
    if (result.data) {
      toast.success(result.message);
      const sendData = makeData(result.data);
      localStorage.setItem('urlDataManual', JSON.stringify(sendData));
      navigate("/create/manual");
    } else {
      toast.error(`Formatting Issue in File: ${e.target.files[0].name}. Only .xls or .xlsx Allowed`, {
        autoClose: 4000
      });
    }
    setFileDetails({ file: undefined });
    setIsLoading({ ...defaultLoading, file: false });
  };

  const handleMoveManual = () => {
    const edit = JSON.parse(localStorage.getItem('edit'));
    if (edit) {
      localStorage.removeItem('urlDataManual');
      localStorage.removeItem('edit');
    }
  };

 
  const primaryButton = "flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm cursor-pointer";
  const secondaryButton = "flex items-center gap-2 px-4 py-2 border border-[#444] rounded-md font-medium bg-[#333] text-[#eee] hover:bg-[#444] transition-colors shadow-sm cursor-pointer";

  return (
    <>
      {!isPopUpOpen.login && (
        <div className={`text-[#EEEEEE] p-4 w-full pt-6 relative transition-opacity duration-200 ${isPopUpOpen.upload ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="flex flex-col items-start gap-6 w-full max-w-6xl mx-auto">
            
      
            <div className="flex flex-col w-full gap-2 border-b border-[#333] pb-4">
              <h1 className="text-2xl font-semibold text-[#EEEEEE]">
                Create Quizzes
              </h1>
              <p className="text-sm text-[#AAAAAA]">Design both protected and unprotected assessments.</p>
            </div>

        
            <div className="flex flex-row items-center w-full justify-between bg-[#222] p-4 rounded-md border border-[#333]">
              <Link to="/create/manual" onClick={handleMoveManual} className={primaryButton}>
                <Plus size={18} />
                <span>Create Manually</span>
              </Link>

              <div className="flex items-center gap-3">
                <a href="./Files/quiz_template.xlsx" className={secondaryButton} download="quiz_template.xlsx">
                  <FileSpreadsheet size={18} />
                  <span className="hidden sm:inline">Download Template</span>
                </a>
                
                <button 
                  className={secondaryButton} 
                  onClick={() => { setIsPopUpOpen({ ...defaultPopUp, upload: true }); setIsStop(true); }}
                >
                  <FolderUp size={18} />
                  <span>Upload File</span>
                </button>
              </div>
            </div>


            <div className="flex w-full justify-end min-h-6">
              {isLoading.file && (
                <div className="flex items-center gap-2 text-[#AAAAAA] text-sm bg-[#222] px-3 py-1 rounded-full border border-[#333]">
                  <Loader type="small" />
                  <span>Verifying file...</span>
                </div>
              )}
            </div>

       
            <ListQuizz defaultPopUp={defaultPopUp} isPopUpOpen={isPopUpOpen} setIsPopUpOpen={setIsPopUpOpen} />
          </div>
        </div>
      )}

 
      {isPopUpOpen.upload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-md text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-xl">
            
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <div className="flex items-center gap-2 text-[#DE5833]">
                <AlertCircle size={20} />
                <span className="font-semibold text-lg">Format Suggestion</span>
              </div>
              <button className="text-[#AAAAAA] hover:text-white transition-colors" onClick={() => { setIsPopUpOpen({ ...defaultPopUp, upload: false }); setIsStop(false); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2 text-sm text-[#CCCCCC] leading-relaxed">
              We highly recommend using our standard Excel template to avoid formatting issues. You can download it, modify it, and upload it here.
              <br /><br />
              <a href="./Files/quiz_template.xlsx" className="text-[#DE5833] hover:underline font-medium inline-flex items-center gap-1" download="quiz_template.xlsx">
                <Download size={14} /> Download standard template
              </a>
              <br />
              <span className="text-[#888] text-xs mt-2 block">*Only .xlsx and .xls files are supported.</span>
            </div>
            
            <div className="flex items-center justify-end gap-3 w-full pt-2">
              <button 
                className="px-4 py-2 rounded-md font-medium bg-transparent text-[#AAAAAA] hover:text-white hover:bg-[#333] transition-colors"
                onClick={() => { setIsPopUpOpen({ ...defaultPopUp, upload: false }); setIsStop(false); }}
              >
                Cancel
              </button>
              <label className="flex items-center justify-center gap-2 px-5 py-2 cursor-pointer rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm">
                <span>Select & Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xls,.xlsx"
                  onChange={(e) => handleUploadFile(e)}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {isPopUpOpen.login && <LoginPopUp />}
    </>
  );
}