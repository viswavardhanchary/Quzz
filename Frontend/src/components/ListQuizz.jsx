import { useEffect, useState } from "react"
import { getQuizzList, removeQuizz, updateOneQuizz } from "../api/quizzApi"
import Loader from "./Loader";
import { toast } from 'react-toastify'
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Forward, Pencil, Trash, X } from 'lucide-react';
import PreviewQuzz from "./PreviewQuzz";
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getSettings } from "../api/settingApi";
import PreviewSettings from "./PreviewSettings";
import { Link } from "react-router-dom";
export default function ListQuizz({ defaultPopUp, isPopUpOpen, setIsPopUpOpen }) {
  const { setIsStop } = useOutletContext()
  const navigate = useNavigate();
  const defaultLoading = {
    data: false,
    edit: {
      index: undefined,
      status: undefined
    },
    delete: {
      index: undefined,
      status: undefined
    }
  }
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const defaultData = {
    id: undefined,
    view: false,
    password: "",
    link: {
      status: false,
      address: ""
    },
    name: "",
    setting: undefined,
    eye: false
  }
  const [viewDetails, setViewDetails] = useState([]);

  useEffect(() => {
    getQuestionsList();
  }, [])
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
            name: curr.name !== "" ? curr.name : `Quizz${index + 1}`,
            lastName: curr.name !== "" ? curr.name : `Quizz${index + 1}`,
            password: curr.password !== "" ? curr.password : "",
            link: curr.link
          }
        });
        const updatedViewDetails = []
        for (let i = 0; i < viewData.length; i++) {
          const obj = {
            ...viewData[i]
          }
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
  }


  const handleNameChange = (e, index) => {
    const data = [...viewDetails];
    data[index].name = e.target.value;
    setViewDetails(data);
  }
  const handleUpdateName = async (index) => {
    const data = [...viewDetails];
    // console.log(data.name);
    if (data[index].name?.trim() === '' || data[index].name === data[index].lastName) {
      return;
    } else {
      const response = await updateOneQuizz(details[index]._id, "name", data[index].name.trim());
      // console.log(response);

      if (response.id === null) {
        toast.error(response.message);
      } else {
        data[index].lastName = data[index].name;
        setViewDetails(data);
      }
    }
  }
  const handleViewChange = (index, value) => {
    const data = [...viewDetails];
    for (let i = 0; i < viewDetails.length; i++) data[i].view = false;
    data[index].view = value;
    data[index].eye = false;
    setViewDetails(data);
  }

  const handleEditClick = async (index) => {
    localStorage.removeItem('urlDataManual');
    localStorage.removeItem('edit');
    navigate(`/create/edit/${details[index]._id}`)
  }
  const handleDeleteClick = async (index) => {
    setIsStop(false);
    setIsLoading({ ...defaultLoading, delete: { index, status: true } });
    setIsPopUpOpen({
      ...defaultPopUp, delete: {
        index: undefined, status: false
      }
    })
    const response = await removeQuizz(details[index]._id);
    if (response.id) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
    setIsLoading({ ...defaultLoading, delete: { index, status: false } });
    getQuestionsList();

  }

  const handleEyeClick = (index, value) => {
    const data = [...viewDetails];
    for (let i = 0; i < viewDetails.length; i++) data[i].eye = false;
    data[index].view = false;
    data[index].eye = value;
    setViewDetails(data);
  }

  const checkLink = (index) => {
    if (!viewDetails[index].link.status) {
      setIsStop(true);
      setIsPopUpOpen({ ...defaultPopUp, link: { index, status: true } });
      return false;
    } else {
      return true;
    }
  }

  const handleShareClick = (index) => {
    const verify = checkLink(index);
    if (!verify) {
      return;
    } else {
      setIsStop(true);
      setIsPopUpOpen({...defaultPopUp , share: {
        index: index,
        status: true
      }});
    }
  }

  const handleTakeQuizz = (index) => {
    const verify = checkLink(index);
    if (!verify) {
      return;
    } else {
      setIsStop(false);
      navigate(details[index].link.address);
    }
  }

  const handleUpdateSecuity = (index) => {
    // console.log(details[index]);
    const sendingData = details[index].questions.map((question) => {
      return {
        question: question.question,
        type: question.type,
        options: question.options,
      }
    });
    const sendingObj = { user: localStorage.getItem("id"), questions: [...sendingData] }
    localStorage.setItem('urlDataManual', JSON.stringify(sendingObj));
    localStorage.removeItem('security');
    const settingId = details[index].settings;
    let quizzId = details[index]._id;
    // console.log(settingId, quizzId);
    setIsStop(false);
    if (settingId) {
      navigate(`/create/security/edit/${quizzId}/${settingId}`);
    } else {
      navigate(`/create/security/add/${quizzId}`);
    }
  }

  const handleCopyClick = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.info("Message Copied to ClipBoard");
    } catch (err) {
      toast.info("Failed to Copy Message");
    }
  }
  const isTrues = (index) => {
    return (isLoading.edit.status && isLoading.edit.index === index) || (isLoading.delete.status && isLoading.delete.index === index)
  }

  return (
    <>
      <div className={`flex items-start w-full flex-col gap-3 mt-5 relative ${(isPopUpOpen.delete.status || isPopUpOpen.link.status || isPopUpOpen.share.status) ? "opacity-50" : ""}`}>
        <h1 className="text-2xl font-bold text-[#ffffff]">List of Quizzes</h1>
        {
          isLoading.data && <div className="flex w-full items-center justify-center"><Loader type="big" /></div>
        }
        {
          !isLoading.data && details &&
          details.map((currQuizz, index) => {
            return (
              <div key={index} className="flex flex-col items-end w-full">
                <div className="w-max p-1 border border-gray-200 border-b-0 rounded-sm font-semibold rounded-b-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer">
                  <span>Created on: {currQuizz.created_on.day}</span>
                </div>
                <div className="w-full flex items-center justify-between p-2 border rounded-md rounded-b-none rounded-tr-none">
                  <div className="flex items-center gap-1">
                    <p className="text-xl">{index + 1}.</p>
                    <input type="text" value={viewDetails[index].name} onChange={(e) => handleNameChange(e, index)} className="text-md sm:text-xl text-[#ff9100] outline-none border-b border-white" onBlur={() => handleUpdateName(index)} />
                  </div>
                  <p className="hidden sm:flex text-md">by {currQuizz.user.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-orange-600  ${isTrues(index) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={() => handleEditClick(index)} >{(isLoading.edit.status && isLoading.edit.index === index) && <span><Loader type="very small" /></span>}
                      <span><Pencil size={20} /></span></span>
                    <span className={`flex items-center gap-1 text-red-600  ${isTrues() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={() => {
                      setIsPopUpOpen({
                        ...defaultPopUp, delete: {
                          index: index, status: true
                        }
                      }); setIsStop(true)
                    }}>
                      {(isLoading.delete.status && isLoading.delete.index === index) && <span><Loader type="very small" /></span>}
                      <span><Trash size={20} /></span>
                    </span>
                    <div className="cursor-pointer" onClick={(e) => handleEyeClick(index, !viewDetails[index].eye)}>
                      {!viewDetails[index].eye && <span><Eye size={20} /></span>}
                      {viewDetails[index].eye && <span><EyeOff size={20} /></span>}
                    </div>
                    <div>
                      {viewDetails[index].view === false && <div className="cursor-pointer" onClick={() => handleViewChange(index, !viewDetails[index].view)}><ChevronDown size={24} /></div>}
                      {viewDetails[index].view === true && <div className="cursor-pointer" onClick={() => handleViewChange(index, !viewDetails[index].view)}><ChevronUp size={24} /></div>}
                    </div>

                  </div>

                </div>
                {viewDetails[index].view && <div className="w-full h-80 border border-t-0 overflow-y-auto">
                  <PreviewQuzz data={currQuizz} />
                </div>}
                {viewDetails[index].eye && <div className="w-full h-80 border border-t-0 overflow-y-auto">
                  <PreviewSettings data={viewDetails[index]} />
                </div>}
                <div className="w-full justify-end flex gap-2 text-[12px] sm:text-[16px]">
                  <div className="w-max p-1 border border-gray-200 border-t-0 rounded-sm font-semibold rounded-t-none bg-[#266e0e] text-white hover:bg-[#468346] cursor-pointer" onClick={() => handleTakeQuizz(index)}>Take Quizze</div>
                  <div className="w-max flex items-center gap-1 p-1 border border-gray-200 border-t-0 rounded-sm font-semibold rounded-t-none bg-[#e49a24] text-white hover:bg-[#e8b547] cursor-pointer" onClick={() => handleShareClick(index)}>
                    <span><Forward size={20} /></span>
                    <span>share</span>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      {isPopUpOpen.delete.status && <div className="absolute z-10 top-50 flex items-center justify-center w-full">
        <div className="">
          <div className="flex items-start flex-col gap-1 max-w-90 text-white p-1 border rounded-md px-2 bg-[#0B1020]">
            <div className="flex items-center justify-between w-full border-b">
              <span className="text-orange-600 text-lg">Danger Operation</span>
              <span className="cursor-pointer" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, delete: {
                    index: undefined, status: false
                  }
                }); setIsStop(false)
              }}><X size={20} /></span>
            </div>
            <div className="py-3">You are Deleting the Quizz <span className="text-red-600 font-extrabold"><i>"{viewDetails[isPopUpOpen.delete.index].name}"</i></span>, There is no Undo Operation, Make Sure You Verified Before Deletion.
            </div>
            <div className="flex items-center justify-between w-full">
              <button className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#838186] text-white hover:bg-[#8d8d8e]" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, delete: {
                    index: undefined, status: false
                  }
                }); setIsStop(false)
              }}>Cancel</button>
              <label className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#ff0000] text-white hover:bg-[#ab2424]">
                <span className="flex items-center gap-1" onClick={() => handleDeleteClick(isPopUpOpen.delete.index)}>Delete</span>
              </label>
            </div>
          </div>
        </div>
      </div>}
      {isPopUpOpen.link.status && <div className="absolute z-10 top-50 flex items-center justify-center w-full">
        <div className="">
          <div className="flex items-start flex-col gap-1 max-w-90 text-white p-1 border rounded-md px-2 bg-[#0B1020]">
            <div className="flex items-center justify-between w-full border-b">
              <span className="text-orange-600 text-lg">Information</span>
              <span className="cursor-pointer" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, link: {
                    index: undefined, status: false
                  }
                }); setIsStop(false)
              }}><X size={20} /></span>
            </div>
            <div className="py-3">You Did Not Completed the Security Details Update it. To continue to Share/Take Test.
            </div>
            <div className="flex items-center justify-between w-full">
              <button className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#838186] text-white hover:bg-[#8d8d8e]" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, link: {
                    index: undefined, status: false
                  }
                }); setIsStop(false)
              }}>Cancel</button>
              <label className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#1a792f] text-white hover:bg-[#136b1d]" onClick={() => handleUpdateSecuity(isPopUpOpen.link.index)} >
                <span className="flex items-center gap-1">Update Details</span>

              </label>
            </div>
          </div>
        </div>
      </div>}
      {isPopUpOpen.share.status && <div className="absolute z-10 top-50 flex items-center justify-center w-full">
        <div className="">
          <div className="flex items-start flex-col gap-1 max-w-90 text-white p-1 border rounded-md px-2 bg-[#0B1020]">
            <div className="flex items-center justify-between w-full border-b">
              <span className="text-orange-600 text-lg">Share</span>
              <span className="cursor-pointer" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, delete: {
                    index: undefined, status: false
                  }
                }); setIsStop(false)
              }}><X size={20} /></span>
            </div>
            <div className="py-3"><div className="flex items-center flex-wrap gap-2 w-full">
              {viewDetails[isPopUpOpen.share.index].link.status && <><div className="flex  items-center text-sm text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal underline"><Link to={viewDetails[isPopUpOpen.share.index].link.address} target="_blank">{viewDetails[isPopUpOpen.share.index].link.address.substring(0,40)}...</Link></div>
                <span className="cursor-pointer wrap-break-word whitespace-normal w-10" onClick={() => handleCopyClick(viewDetails[isPopUpOpen.share.index].link.address)}><Copy size={18} /></span></>
              }
              {!viewDetails[isPopUpOpen.share.index].link.status && <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">To Active the Link,Click on the Pencil Icon.</div>}
              <div className={`w-3 h-3 rounded-md ${viewDetails[isPopUpOpen.share.index].link.status ? "bg-green-600" : "bg-red-600"}`} title={viewDetails[isPopUpOpen.share.index].link.status ? "Link is Active" : "Link No Active"}></div>

            </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <button className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#838186] text-white hover:bg-[#8d8d8e]" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, delete: {
                    index: undefined, status: false
                  }
                }); setIsStop(false)
              }}>Close</button>

            </div>
          </div>
        </div>
      </div>}

    </>
  )
}