import { useEffect, useState } from "react";
import { getQuizzList, removeQuizz, updateOneQuizz } from "../api/quizzApi";
import Loader from "./Loader";
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Forward, Pencil, Trash2, X, Settings, Calendar, User, Link as LinkIcon, AlertCircle } from 'lucide-react';
import PreviewQuzz from "./PreviewQuzz";
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { getSettings } from "../api/settingApi";
import PreviewSettings from "./PreviewSettings";

export default function ListQuizz({ defaultPopUp, isPopUpOpen, setIsPopUpOpen }) {
  const { setIsStop } = useOutletContext();
  const navigate = useNavigate();
  
  const defaultLoading = {
    data: false,
    edit: { index: undefined, status: undefined },
    delete: { index: undefined, status: undefined }
  };
  
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  
  const defaultData = {
    id: undefined,
    view: false,
    password: "",
    link: { status: false, address: "" },
    name: "",
    setting: undefined,
    eye: false
  };
  
  const [viewDetails, setViewDetails] = useState([]);

  useEffect(() => {
    getQuestionsList();
  }, []);

  const getQuestionsList = async () => {
    setIsLoading({ ...defaultLoading, data: true });
    const id = localStorage.getItem("id");
    
    if (id !== null) {
      const response = await getQuizzList(id);
      if (response.data) {
        setDetails(response.data.reverse());
        const viewData = response.data.map((curr, index) => {
          return {
            ...defaultData,
            id: curr._id,
            name: curr.name !== "" ? curr.name : `Quiz ${index + 1}`,
            lastName: curr.name !== "" ? curr.name : `Quiz ${index + 1}`,
            password: curr.password !== "" ? curr.password : "",
            link: curr.link
          };
        });
        
        const updatedViewDetails = [];
        for (let i = 0; i < viewData.length; i++) {
          const obj = { ...viewData[i] };
          if (response.data[i].settings) {
            const response2 = await getSettings(response.data[i].settings);
            if (response2.data) {
              obj.setting = { ...response2.data };
            } else {
              toast.error(response2.message);
              setIsLoading({ ...defaultLoading, data: false });
              return;
            }
          }
          updatedViewDetails.push(obj);
        }
        setViewDetails(updatedViewDetails);
      } else {
        toast.error("Failed to Fetch the Quizzes");
      }
    }
    setIsLoading({ ...defaultLoading, data: false });
  };

  const handleNameChange = (e, index) => {
    const data = [...viewDetails];
    data[index].name = e.target.value;
    setViewDetails(data);
  };

  const handleUpdateName = async (index) => {
    const data = [...viewDetails];
    if (data[index].name?.trim() === '' || data[index].name === data[index].lastName) {
      return;
    } else {
      const response = await updateOneQuizz(details[index]._id, "name", data[index].name.trim());
      if (response.id === null) {
        toast.error(response.message);
      } else {
        data[index].lastName = data[index].name;
        setViewDetails(data);
      }
    }
  };

  const handleViewChange = (index, value) => {
    const data = [...viewDetails];
    for (let i = 0; i < viewDetails.length; i++) data[i].view = false;
    data[index].view = value;
    data[index].eye = false;
    setViewDetails(data);
  };

  const handleEditClick = async (index) => {
    localStorage.removeItem('urlDataManual');
    localStorage.removeItem('edit');
    navigate(`/create/edit/${details[index]._id}`);
  };

  const handleDeleteClick = async (index) => {
    setIsStop(false);
    setIsLoading({ ...defaultLoading, delete: { index, status: true } });
    setIsPopUpOpen({ ...defaultPopUp, delete: { index: undefined, status: false } });
    
    const response = await removeQuizz(details[index]._id);
    if (response.id) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
    
    setIsLoading({ ...defaultLoading, delete: { index, status: false } });
    getQuestionsList();
  };

  const handleEyeClick = (index, value) => {
    const data = [...viewDetails];
    for (let i = 0; i < viewDetails.length; i++) data[i].eye = false;
    data[index].view = false;
    data[index].eye = value;
    setViewDetails(data);
  };

  const checkLink = (index) => {
    if (!viewDetails[index].link.status) {
      setIsStop(true);
      setIsPopUpOpen({ ...defaultPopUp, link: { index, status: true } });
      return false;
    }
    return true;
  };

  const handleShareClick = (index) => {
    if (checkLink(index)) {
      setIsStop(true);
      setIsPopUpOpen({ ...defaultPopUp, share: { index: index, status: true } });
    }
  };

  const handleTakeQuizz = (index) => {
    if (checkLink(index)) {
      setIsStop(false);
      navigate(details[index].link.address);
    }
  };

  const handleUpdateSecuity = (index) => {
    const sendingData = details[index].questions.map((question) => ({
      question: question.question,
      type: question.type,
      options: question.options,
    }));
    const sendingObj = { user: localStorage.getItem("id"), questions: [...sendingData] };
    localStorage.setItem('urlDataManual', JSON.stringify(sendingObj));
    localStorage.removeItem('security');
    
    const settingId = details[index].settings;
    const quizzId = details[index]._id;
    
    setIsStop(false);
    if (settingId) {
      navigate(`/create/security/edit/${quizzId}/${settingId}`);
    } else {
      navigate(`/create/security/add/${quizzId}`);
    }
  };

  const handleCopyClick = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Link Copied to Clipboard");
    } catch (err) {
      toast.error("Failed to Copy Link");
    }
  };

  const isTrues = (index) => {
    return (isLoading.edit.status && isLoading.edit.index === index) || 
           (isLoading.delete.status && isLoading.delete.index === index);
  };

 
  const primaryBtn = "flex items-center gap-1.5 px-4 py-2 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm cursor-pointer";
  const secondaryBtn = "flex items-center gap-1.5 px-4 py-2 rounded-md font-medium bg-[#333] border border-[#444] text-[#EEE] hover:bg-[#444] transition-colors shadow-sm cursor-pointer";

  return (
    <>
      <div className={`flex flex-col items-start w-full gap-4 mt-6 transition-opacity duration-200 ${(isPopUpOpen.delete.status || isPopUpOpen.link.status || isPopUpOpen.share.status) ? "opacity-40 pointer-events-none" : ""}`}>
        
        {isLoading.data ? (
          <div className="flex w-full items-center justify-center py-20"><Loader type="big" /></div>
        ) : (
          details && details.map((currQuizz, index) => (
            <div key={index} className="flex flex-col w-full bg-[#222222] border border-[#333333] rounded-lg shadow-sm overflow-hidden mb-2">
              

              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#1A1A1A] gap-4">
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#888888] font-medium text-lg">{index + 1}.</span>
                    <input 
                      type="text" 
                      value={viewDetails[index].name} 
                      onChange={(e) => handleNameChange(e, index)} 
                      onBlur={() => handleUpdateName(index)}
                      className="text-lg font-medium text-[#EEEEEE] bg-transparent border-b border-transparent hover:border-[#444] focus:border-[#DE5833] outline-none transition-colors px-1" 
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#888888] px-6">
                    <span className="flex items-center gap-1"><User size={12} /> {currQuizz.user.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {currQuizz.created_on.day}</span>
                  </div>
                </div>

           
                <div className="flex items-center gap-3 sm:gap-4 px-6 sm:px-0">
                  <button 
                    className={`flex items-center justify-center p-1.5 text-[#AAAAAA] hover:text-[#EEEEEE] hover:bg-[#333] rounded transition-colors ${isTrues(index) ? "opacity-50 cursor-not-allowed" : ""}`} 
                    onClick={() => handleEditClick(index)}
                    title="Edit Quiz"
                  >
                    {(isLoading.edit.status && isLoading.edit.index === index) ? <Loader type="very small" /> : <Pencil size={18} />}
                  </button>
                  
                  <button 
                    className={`flex items-center justify-center p-1.5 text-[#AAAAAA] hover:text-[#EF4444] hover:bg-[#333] rounded transition-colors ${isTrues(index) ? "opacity-50 cursor-not-allowed" : ""}`} 
                    onClick={() => { setIsPopUpOpen({ ...defaultPopUp, delete: { index: index, status: true } }); setIsStop(true); }}
                    title="Delete Quiz"
                  >
                    {(isLoading.delete.status && isLoading.delete.index === index) ? <Loader type="very small" /> : <Trash2 size={18} />}
                  </button>
                  
                  <div className="h-4 w-px bg-[#444]"></div>

                  <button 
                    className={`flex items-center justify-center p-1.5 rounded transition-colors ${viewDetails[index].eye ? "text-[#DE5833] bg-[#DE5833]/10" : "text-[#AAAAAA] hover:text-[#EEEEEE] hover:bg-[#333]"}`} 
                    onClick={() => handleEyeClick(index, !viewDetails[index].eye)}
                    title="Preview Settings"
                  >
                    <Settings size={18} />
                  </button>

                  <button 
                    className={`flex items-center justify-center p-1.5 rounded transition-colors ${viewDetails[index].view ? "text-[#DE5833] bg-[#DE5833]/10" : "text-[#AAAAAA] hover:text-[#EEEEEE] hover:bg-[#333]"}`} 
                    onClick={() => handleViewChange(index, !viewDetails[index].view)}
                    title="Preview Quiz Questions"
                  >
                    {viewDetails[index].view ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

    
              {viewDetails[index].view && (
                <div className="w-full h-80 border-t border-[#333333] overflow-y-auto bg-[#111111] p-4">
                  <PreviewQuzz data={currQuizz} />
                </div>
              )}
              {viewDetails[index].eye && (
                <div className="w-full h-80 border-t border-[#333333] overflow-y-auto bg-[#111111] p-4">
                  <PreviewSettings data={viewDetails[index]} />
                </div>
              )}

         
              <div className="w-full flex items-center justify-end gap-3 p-3 bg-[#1A1A1A] border-t border-[#333333]">
                <button className={secondaryBtn} onClick={() => handleShareClick(index)}>
                  <Forward size={16} />
                  <span>Share</span>
                </button>
                <button className={primaryBtn} onClick={() => handleTakeQuizz(index)}>
                  <LinkIcon size={16} />
                  <span>Take Quiz</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>


      {isPopUpOpen.delete.status && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-md text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-xl">
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <div className="flex items-center gap-2 text-[#EF4444]">
                <AlertCircle size={20} />
                <span className="font-semibold text-lg">Confirm Deletion</span>
              </div>
              <button className="text-[#AAAAAA] hover:text-white transition-colors" onClick={() => { setIsPopUpOpen({ ...defaultPopUp, delete: { index: undefined, status: false } }); setIsStop(false); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2 text-sm text-[#CCCCCC] leading-relaxed">
              You are about to delete <span className="text-[#EEEEEE] font-bold">"{viewDetails[isPopUpOpen.delete.index].name}"</span>. This action cannot be undone. Are you sure you want to proceed?
            </div>
            
            <div className="flex items-center justify-end gap-3 w-full pt-2">
              <button 
                className="px-4 py-2 rounded-md font-medium bg-transparent text-[#AAAAAA] hover:text-white hover:bg-[#333] transition-colors"
                onClick={() => { setIsPopUpOpen({ ...defaultPopUp, delete: { index: undefined, status: false } }); setIsStop(false); }}
              >
                Cancel
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-md font-medium bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm"
                onClick={() => handleDeleteClick(isPopUpOpen.delete.index)}
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}


      {isPopUpOpen.link.status && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-md text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-xl">
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <div className="flex items-center gap-2 text-[#DE5833]">
                <Settings size={20} />
                <span className="font-semibold text-lg">Action Required</span>
              </div>
              <button className="text-[#AAAAAA] hover:text-white transition-colors" onClick={() => { setIsPopUpOpen({ ...defaultPopUp, link: { index: undefined, status: false } }); setIsStop(false); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2 text-sm text-[#CCCCCC] leading-relaxed">
              Security settings for this quiz are incomplete. You must update them before you can share or take the test.
            </div>
            
            <div className="flex items-center justify-end gap-3 w-full pt-2">
              <button 
                className="px-4 py-2 rounded-md font-medium bg-transparent text-[#AAAAAA] hover:text-white hover:bg-[#333] transition-colors"
                onClick={() => { setIsPopUpOpen({ ...defaultPopUp, link: { index: undefined, status: false } }); setIsStop(false); }}
              >
                Cancel
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm"
                onClick={() => handleUpdateSecuity(isPopUpOpen.link.index)}
              >
                Update Settings
              </button>
            </div>
          </div>
        </div>
      )}


      {isPopUpOpen.share.status && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-md text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-xl">
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <div className="flex items-center gap-2 text-[#EEEEEE]">
                <Forward size={20} />
                <span className="font-semibold text-lg">Share Quiz</span>
              </div>
              <button className="text-[#AAAAAA] hover:text-white transition-colors" onClick={() => { setIsPopUpOpen({ ...defaultPopUp, share: { index: undefined, status: false } }); setIsStop(false); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2">
              {viewDetails[isPopUpOpen.share.index].link.status ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-[#AAAAAA]">Direct Link</span>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 bg-[#1A1A1A] border border-[#444] rounded-md p-2.5 text-sm text-[#EEEEEE] truncate">
                      {viewDetails[isPopUpOpen.share.index].link.address}
                    </div>
                    <button 
                      className="p-2.5 bg-[#333] hover:bg-[#444] border border-[#444] rounded-md text-[#EEEEEE] transition-colors"
                      onClick={() => handleCopyClick(viewDetails[isPopUpOpen.share.index].link.address)}
                      title="Copy to clipboard"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 bg-[#1A1A1A] border border-[#444] rounded-md gap-2 text-center">
                  <div className="flex items-center gap-1.5 text-xs text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full border border-[#EF4444]/20 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div> Inactive
                  </div>
                  <p className="text-sm text-[#CCCCCC]">This link is currently inactive. Click the edit (pencil) icon to activate it.</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end w-full pt-2">
              <button 
                className="px-5 py-2 rounded-md font-medium bg-[#333] border border-[#444] text-[#EEEEEE] hover:bg-[#444] transition-colors"
                onClick={() => { setIsPopUpOpen({ ...defaultPopUp, share: { index: undefined, status: false } }); setIsStop(false); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}