import { useEffect, useState } from "react"
import { CirclePlus, Trash, Info, Check, ChevronDown, ChevronUp, MoveRight, TriangleAlert, Save, ArrowRightFromLine } from 'lucide-react'
import { toast } from 'react-toastify'
import Loader from "./Loader";
import { validateUser } from "../api/reCalls";
import LoginPopUp from "./LoginPopUp";
import { addQuizz } from "../api/quizzApi";
import {useNavigate} from 'react-router-dom';
import { useLocation } from "react-router-dom";

export default function QuizzManual({data}) {
  const navigate = useNavigate();
  const location = useLocation();
  const urlData = location.state;
  const [isLoading, setIsLoading] = useState({
    clickType: undefined,
  });
  const [details, setDetails] = useState(urlData !== null ? urlData : [
    {
      question: "",
      type: "",
      minQuestion: false,
      minOption: false,
      options: [
        {
          value: "",
          answer: false
        }
      ],
      err: {
        status: undefined,
        message: ""
      },
      onCloseError: undefined,
    }
  ]);

  const [loginPopUp, setLoginPopUp] = useState(false);
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

  const handleQuestionChange = (id, e) => {
    const data = [...details];
    data[id].question = e.target.value;
    setDetails(data);
  }
  const handleTypeChange = (id, type) => {
    const data = [...details];
    data[id].type = type;
    setDetails(data);
  }
  const handleOptionChange = (idx1, idx2, e) => {
    const data = [...details];
    data[idx1].options[idx2].value = e.target.value;
    setDetails(data);
  }
  const handleAddOptions = (idx1, idx2) => {
    const data = [...details];
    for (let i = data[idx1].options.length - 1; i > idx2; i--) {
      data[idx1].options[i + 1] = data[idx1].options[i];
    }
    data[idx1].options[idx2 + 1] = {
      value: "",
      answer: false,
    };
    setDetails(data);
  }
  const handleDeleteOptions = (idx1, idx2) => {
    const data = [...details];
    data[idx1].options.splice(idx2, 1);
    console.log(data);
    setDetails(data);
  }
  const handleCurrentTypeChange = (index) => {
    const data = [...details];
    data[index].type = "";
    setDetails(data);
  }
  const handleAddQuestion = (index) => {
    const newQuestion = {
      question: "",
      type: "",
      minQuestion: false,
      minOption: false,
      options: [
        {
          value: "",
          answer: false,
        }
      ],
      err: {
        status: undefined,
        message: ""
      },
      onCloseError: undefined,
    }
    handleQuestionView(index, true);
    setDetails((prev) => ([...prev.slice(0, index + 1), newQuestion, ...prev.slice(index + 1, prev.length)]));


  }
  const verifyPrevQuestion = (index, show) => {
    if (details[index].question.trim() !== '') {
      if (details[index].type === '') {
        if (show) toast.info("Please select the type");
        else return {
          message: "Please select the type",
          status: true
        };
      }
      else if (details[index].type === 'option' || details[index].type === 'checkbox') {
        const check = details[index].options.filter((option) => option.value.trim() === "");
        const check2 = details[index].options.filter((option) => option.answer === true);
        if (check.length !== 0) {
          if (show) toast.info("Please fill all options");
          else return {
            message: "Please fill all options",
            status: true
          };
        } else if (check2.length === 0) {
          if (show) toast.info("Please Choose the Answer");
          else return {
            message: "Please Choose the Answer",
            status: true
          };
        } else {
          if (show) handleAddQuestion(index);
          else return {
            message: "Data is Valid",
            status: false
          };
        }
      } else {
        if (show) handleAddQuestion(index);
        else return {
          message: "Data is Valid",
          status: false
        };
      }
    } else {
      if (show) toast.info("Please fill the Question");
      else return {
        message: "Please fill the Question",
        status: true
      };
    }
  }
  const handleAnswerChange = (idx1, idx2) => {
    const data = [...details];
    if (data[idx1].type === 'option') {
      for (let i = 0; i < data[idx1].options.length; i++) {
        if (i == idx2) {
          data[idx1].options[i].answer = !data[idx1].options[i].answer;
        } else {
          data[idx1].options[i].answer = false;
        }
      }
    } else {
      data[idx1].options[idx2].answer = !data[idx1].options[idx2].answer;
    }
    setDetails(data);
  }
  const handleQuestionView = (index, value) => {
    const data = [...details];
    data[index].minQuestion = value;
    setDetails(data);
  }
  const handleOptionsView = (index) => {
    const data = [...details];
    data[index].minOption = !data[index].minOption;
    setDetails(data);
  }

  const handleDeleteQuestion = (index) => {
    const data = [...details];
    data.splice(index, 1);
    console.log(data);
    setDetails(data);
  }

  const verifiyData = () => {
    const data = [...details];
    const verificationData = details.map((question, index) => {
      const vdata = verifyPrevQuestion(index);
      data[index].err = vdata;
      if (vdata.status) {
        data[index].minQuestion = false;
        data[index].minOption = false;
      }
      return vdata.status;
    });
    setDetails(data);
    return verificationData;
  }

  const checkOnClose = (index, show) => {
    const data = [...details];
    const obj = verifyPrevQuestion(index, false);
    if (show === false) {
      data[index].onCloseError = undefined;
    } else if (obj.status === true) {
      data[index].onCloseError = true;
    } else {
      data[index].onCloseError = false;
    }
    setDetails(data);
  }

  const saveData = async () => {
    setIsLoading({clickType: "save"});
    const arr = verifiyData();
    if (arr.includes(true)) {
      toast.info("Fill All the Errors Mentioned");
      setIsLoading({clickType: undefined});
    } else {
      const sendingData = details.map((question) => {
        return {
          question: question.question,
          type: question.type,
          options: question.options,
        }
      });
      const sendingObj = {user: localStorage.getItem("id") , questions : [...sendingData]}
      const response = await addQuizz(sendingObj);
      if(response.id !== null) {
        toast.success(response.message);
        setIsLoading({clickType: undefined});
        navigate("/create");
      }else {
        toast.error(response.message);
        setIsLoading({clickType: undefined});
      }
    }
  }

  

  return (
    <>
      {!loginPopUp &&
        <div>
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="fixed h-12 top-8 flex flex-wrap items-center justify-between p-2 w-full mt-4 z-9 bg-[#0B1020]">
              <div className="flex flex-col gap-1 items-center">
                <h1 className="text-2xl text-[#ff9100] text-center">Create Quizz</h1>
                <div className="border w-20 border-white"></div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`hidden w-max sm:flex items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.clickType !== undefined ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={saveData} disabled={isLoading.clickType !== undefined}>
                  {isLoading.clickType !== 'save' && <span>Save</span>}
                  {isLoading.clickType === 'save' && <>
                    <span>
                      <Loader type="small" />
                    </span>
                    <span>Saving....</span>
                  </>}
                </div>
                <div className={`flex w-max sm:hidden items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.clickType !== undefined ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={saveData} disabled={isLoading.clickType !== undefined} title="save">
                  <Save />
                </div>
                <div className={`hidden w-max sm:flex items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.clickType !== undefined ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} disabled={isLoading.clickType !== undefined}>
                  {isLoading.clickType !== 'saveandnext' && <><span>Save & Next Step</span>
                    <span><MoveRight /></span></>}
                  {isLoading.clickType === 'saveandnext' && <><span>Processing...</span>
                    <span><MoveRight /></span></>}
                </div>
                <div className={`flex w-max sm:hidden items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.clickType !== undefined ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} disabled={isLoading.clickType !== undefined} title="save and next">
                  <ArrowRightFromLine />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start p-2 gap-8 w-full mt-15">
              {
                details.map((question, index) => {
                  return (
                    <div className="w-full" key={index}>
                      {question.err.status === true &&
                        <p className='flex items-center  text-red-600 text-sm font-bold gap-1 flex-row-reverse'>
                          <span>{question.err.message}</span>
                          <span><TriangleAlert size={16} /></span>
                        </p>}

                      <div className="text-white w-full flex flex-col border pt-0 p-2 rounded-md rounded-br-none" >
                        <div className="flex items-center justify-between w-full mb-2">
                          <label htmlFor={`question${index}`} className="flex items-center gap-1 text-xl text-[#ffae00]"><span>{index + 1}. Question</span>
                            {question.onCloseError === true &&
                              <span className='flex items-center  text-red-600 text-sm sm:text-md font-bold gap-1 flex-row-reverse'>
                                <span># Fields are Missing</span>
                              </span>}
                            {question.onCloseError === false &&
                              <span className='flex items-center  text-green-600 text-sm sm:text-md font-bold gap-1 flex-row-reverse'>
                                <span># All Fields Are Filled</span>
                              </span>}
                          </label>
                          <div>
                            {question.minQuestion &&
                              <div className="cursor-pointer" onClick={() => { handleQuestionView(index, false); checkOnClose(index, false) }}><ChevronDown size={24} /></div>
                            }
                            {!question.minQuestion &&
                              <div className="cursor-pointer" onClick={() => { handleQuestionView(index, true); checkOnClose(index, true) }}><ChevronUp size={24} /></div>
                            }
                          </div>

                        </div>
                        <div className="flex flex-col items-start w-full">
                          <div className="flex items-center justify-end w-full">
                            {question.type !== "" && !question.minQuestion && <div className="w-max p-1 border border-gray-200 border-b-0 rounded-sm font-semibold rounded-b-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer">Type: {question.type}</div>}
                          </div>

                          {!question.minQuestion && <textarea type="text" id={`question${index}`} name={`question${index}`} placeholder="Enter the Question" autoComplete="noreferer" className="border outline-none bg-white text-black w-full rounded-md rounded-r-none p-1 border-r-0" value={question.question} onChange={(e) => handleQuestionChange(index, e)}></textarea>}
                        </div>
                        {(question.type === "" && !question.minQuestion) &&
                          <div className="flex items-top w-full justify-end">
                            <div className="w-full flex items-top justify-end gap-2 text-[12px] sm:text-[16px]">
                              <div className="w-max p-1 border border-gray-200 border-t-0 rounded-sm font-semibold rounded-t-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer" onClick={() => handleTypeChange(index, "option")}>Options +</div>
                              <div className="w-max p-1 border border-gray-200 border-t-0 rounded-sm font-semibold rounded-t-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer" onClick={() => handleTypeChange(index, "checkbox")}>Check Boxes +</div>
                              <div className="w-max p-1 border border-gray-200 border-t-0 rounded-sm font-semibold rounded-t-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer" onClick={() => handleTypeChange(index, "textfield")}>Text Field +</div>
                            </div>
                          </div>}
                        {question.type !== "" && !question.minQuestion &&
                          <div className="flex items-center w-full justify-end">
                            <div className="flex items-center gap-5">
                              <div className="w-max p-1 border border-t-0 border-gray-200 rounded-sm font-semibold rounded-t-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer" onClick={() => handleCurrentTypeChange(index)}>Change Type</div>
                            </div>
                          </div>
                        }
                        {question.type !== "" && question.type !== "textfield" && !question.minQuestion && <div className="flex items-center justify-between w-full mt-2">
                          <label htmlFor={`option${index}`} className="text-xl text-[#ffae00]">Options</label>
                          <div>
                            {question.minOption &&
                              <div className="cursor-pointer" onClick={() => handleOptionsView(index)}><ChevronDown size={24} /></div>
                            }
                            {!question.minOption &&
                              <div className="cursor-pointer" onClick={() => handleOptionsView(index)}><ChevronUp size={24} /></div>
                            }
                          </div>

                        </div>}
                        {!question.minQuestion && <div className="flex flex-col gap-2 items-start mt-2">
                          {!question.minOption && (question.type === "option" || question.type === 'checkbox') &&
                            <div className="flex items-center w-full">
                              <div className="flex items-center gap-1 text-md text-green-500">
                                <span><Info size={16} /></span>
                                <span>Click on the Option, To keep as answer</span>
                              </div>
                            </div>}

                          {!question.minOption && (question.type === "option" || question.type === "checkbox") && question.options.map((option, index2) => {
                            return <div className="flex items-center gap-2 w-full pl-5" key={index2}>
                              <div className="w-full flex gap-4 items-center">
                                <div className={`flex item-center justify-center cursor-pointer text-black border border-white w-5 h-5 ${question.type === 'option' ? "rounded-full" : "rounded-xs"} ${option.answer === true && "bg-green-500"}`} onClick={() => { handleAnswerChange(index, index2) }}>
                                  {option.answer === true && <Check size={16} />}
                                </div>
                                <textarea type="text" placeholder="Enter the Option" className="border outline-none p-1 rounded-sm bg-white/90 w-full text-black min-h-5" onChange={(e) => handleOptionChange(index, index2, e)} value={option.value}></textarea>
                              </div>

                              <p className="cursor-pointer text-green-600" onClick={() => handleAddOptions(index, index2)}><CirclePlus size={20} /></p>
                              {index2 !== 0 && <p className={`text-red-600 cursor-pointer`} onClick={() => handleDeleteOptions(index, index2)} ><Trash size={20} /></p>}
                            </div>
                          })}
                          {question.type === 'textfield' && !question.minOption && <div className="flex items-center gap-1 text-[#00d9ff]">
                            <span>
                              <Info size={18} />
                            </span>
                            <span>Text Field does not have Automatic Evalution, Answers Should be Evaluted Manually!</span>
                          </div>}
                        </div>}
                      </div>
                      <div className="w-full justify-end flex gap-2">
                        <div className="w-max p-1 border border-gray-200 border-t-0 rounded-sm font-semibold rounded-t-none bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer" onClick={() => { checkOnClose(index, true); verifyPrevQuestion(index, true); }}>Add +</div>
                        {index !== 0 && <div className="flex items-center gap-1 w-max p-1 border border-gray-200 border-t-0 rounded-sm font-semibold rounded-t-none bg-[#ed3a3a] text-white hover:bg-[#d92828] cursor-pointer" onClick={() => handleDeleteQuestion(index)}>
                          <span><Trash size={16} /></span>
                          <span>Delete</span>
                        </div>}
                      </div>
                    </div>)
                })
              }
            </div>
          </div>
        </div>
      }
      {
        loginPopUp && <LoginPopUp/>
      }
    </>
  )
}