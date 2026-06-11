import { useEffect, useState } from "react";
import { CirclePlus, Trash2, Info, Check, ChevronDown, ChevronUp, MoveRight, TriangleAlert, Save, List, CheckSquare, AlignLeft, Plus, RefreshCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import Loader from "../components/Loader";
import { validateUser } from "../api/reCalls";
import LoginPopUp from "../components/LoginPopUp";
import { addQuizz, getQuizz, updateQuizz } from "../api/quizzApi";
import { useNavigate, useLocation } from 'react-router-dom';

export default function QuizzManual({ data }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const defaultDetails = [
    {
      question: "",
      type: "",
      minQuestion: false,
      minOption: false,
      options: [
        { value: "", answer: false }
      ],
      err: { status: undefined, message: "" },
      onCloseError: undefined,
    }
  ];
  
  const defaultLoading = { clickType: undefined, data: false };
  const [isLoading, setIsLoading] = useState(defaultLoading);
  
  const urlData = JSON.parse(localStorage.getItem('urlDataManual'));
  const [details, setDetails] = useState(urlData ? urlData : defaultDetails);
  const [loginPopUp, setLoginPopUp] = useState(false);

  useEffect(() => {
    check();
    findPath();
  }, []);

  async function check() {
    setIsLoading({ ...defaultLoading, data: true });
    const ans = await validateUser();
    if (ans === false) {
      setLoginPopUp(true);
    } else {
      setLoginPopUp(false);
    }
    setIsLoading({ ...defaultLoading, data: false });
  }

  const findPath = async () => {
    setIsLoading({ ...defaultLoading, data: true });
    const path = location.pathname.split("/");
    if (path.includes("edit")) {
      const id = path[path.length - 1];
      const response = await getQuizz(id);
      if (response.data) {
        const data = response.data.questions.map((question) => {
          return {
            question: question.question,
            type: question.type,
            minQuestion: false,
            minOption: false,
            options: question.options,
            err: { status: undefined, message: "" },
            onCloseError: undefined,
          };
        });
        localStorage.setItem('urlDataManual', JSON.stringify(data));
        localStorage.setItem('edit', JSON.stringify(true));
        localStorage.setItem('settingId', JSON.stringify(response.data?.settings));
        setIsLoading({ ...defaultLoading, data: false });
        setDetails(data);
      } else {
        toast.error(response.message);
      }
    } else {
      setIsLoading({ ...defaultLoading, data: false });
    }
  };

  const handleQuestionChange = (id, e) => {
    const data = [...details];
    data[id].question = e.target.value;
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleTypeChange = (id, type) => {
    const data = [...details];
    data[id].type = type;
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleOptionChange = (idx1, idx2, e) => {
    const data = [...details];
    data[idx1].options[idx2].value = e.target.value;
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleAddOptions = (idx1, idx2) => {
    const data = [...details];
    for (let i = data[idx1].options.length - 1; i > idx2; i--) {
      data[idx1].options[i + 1] = data[idx1].options[i];
    }
    data[idx1].options[idx2 + 1] = { value: "", answer: false };
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleDeleteOptions = (idx1, idx2) => {
    const data = [...details];
    data[idx1].options.splice(idx2, 1);
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleCurrentTypeChange = (index) => {
    const data = [...details];
    data[index].type = "";
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleAddQuestion = (index) => {
    const newQuestion = {
      question: "",
      type: "",
      minQuestion: false,
      minOption: false,
      options: [{ value: "", answer: false }],
      err: { status: undefined, message: "" },
      onCloseError: undefined,
    };
    handleQuestionView(index, true);
    const data = [...details.slice(0, index + 1), newQuestion, ...details.slice(index + 1, details.length)];
    setDetails(data);
    localStorage.setItem('urlDataManual', JSON.stringify(data));
  };

  const verifyPrevQuestion = (index, show) => {
    if (details[index].question.trim() !== '') {
      if (details[index].type === '') {
        if (show) toast.info("Please select the type");
        else return { message: "Please select the type", status: true };
      } else if (details[index].type === 'option' || details[index].type === 'checkbox') {
        const check = details[index].options.filter((option) => String(option.value).trim() === "");
        const check2 = details[index].options.filter((option) => option.answer === true);
        if (check.length !== 0) {
          if (show) toast.info("Please fill all options");
          else return { message: "Please fill all options", status: true };
        } else if (check2.length === 0) {
          if (show) toast.info("Please Choose the Answer");
          else return { message: "Please Choose the Answer", status: true };
        } else {
          if (show) handleAddQuestion(index);
          else return { message: "Data is Valid", status: false };
        }
      } else {
        if (show) handleAddQuestion(index);
        else return { message: "Data is Valid", status: false };
      }
    } else {
      if (show) toast.info("Please fill the Question");
      else return { message: "Please fill the Question", status: true };
    }
  };

  const handleAnswerChange = (idx1, idx2) => {
    const data = [...details];
    if (data[idx1].type === 'option') {
      for (let i = 0; i < data[idx1].options.length; i++) {
        data[idx1].options[i].answer = (i === idx2) ? !data[idx1].options[i].answer : false;
      }
    } else {
      data[idx1].options[idx2].answer = !data[idx1].options[idx2].answer;
    }
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleQuestionView = (index, value) => {
    const data = [...details];
    data[index].minQuestion = value;
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleOptionsView = (index) => {
    const data = [...details];
    data[index].minOption = !data[index].minOption;
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const handleDeleteQuestion = (index) => {
    const data = [...details];
    data.splice(index, 1);
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

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
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
    return verificationData;
  };

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
    localStorage.setItem('urlDataManual', JSON.stringify(data));
    setDetails(data);
  };

  const saveData = async () => {
    setIsLoading({ ...defaultLoading, clickType: "save" });
    const arr = verifiyData();
    if (arr.includes(true)) {
      toast.info("Please fix the errors mentioned");
      setIsLoading({ ...defaultLoading, clickType: undefined });
    } else {
      const sendingData = details.map((question) => ({
        question: question.question,
        type: question.type,
        options: question.options,
      }));
      const sendingObj = { user: localStorage.getItem("id"), questions: [...sendingData] };
      
      const path = location.pathname.split("/");
      const isEdit = path.includes("edit");
      
      const response = isEdit 
        ? await updateQuizz(sendingObj, path[path.length - 1])
        : await addQuizz(sendingObj);

      if (response.id !== null) {
        localStorage.removeItem('urlDataManual');
        localStorage.removeItem('edit');
        toast.success(response.message);
        navigate("/create");
      } else {
        toast.error(response.message);
      }
      setIsLoading({ ...defaultLoading, clickType: undefined });
    }
  };

  const saveAndNext = () => {
    setIsLoading({ ...defaultLoading, clickType: "saveandnext" });
    const arr = verifiyData();
    if (arr.includes(true)) {
      toast.info("Please fix the errors mentioned");
      setIsLoading({ ...defaultLoading, clickType: undefined });
    } else {
      const sendingData = details.map((question) => ({
        question: question.question,
        type: question.type,
        options: question.options,
      }));
      const sendingObj = { user: localStorage.getItem("id"), questions: [...sendingData] };
      localStorage.setItem('urlDataManual', JSON.stringify(sendingObj));
      localStorage.removeItem('security');
      
      const settingId = localStorage.getItem('settingId') !== 'undefined' ? JSON.parse(localStorage.getItem('settingId')) : null;
      const path = location.pathname.split("/");
      const quizzId = path.includes("edit") ? path[path.length - 1] : null;

      setIsLoading({ ...defaultLoading, clickType: undefined });
      
      if (settingId && quizzId) {
        localStorage.removeItem('settingId');
        navigate(`/create/security/edit/${quizzId}/${settingId}`);
      } else if (quizzId) {
        navigate(`/create/security/add/${quizzId}`);
      } else {
        navigate(`/create/security`);
      }
    }
  };

  const clearEveryThing = () => {
    localStorage.removeItem("urlDataManual");
    setDetails(defaultDetails);
  };

  
  const inputStyles = "w-full bg-[#1A1A1A] border border-[#444] rounded-md p-2.5 text-[#EEEEEE] placeholder-[#888] outline-none focus:border-[#DE5833] focus:ring-1 focus:ring-[#DE5833] transition-all resize-y min-h-[80px]";
  const optionInputStyles = "w-full bg-[#1A1A1A] border border-[#444] rounded-md p-2 text-[#EEEEEE] placeholder-[#888] outline-none focus:border-[#DE5833] transition-all resize-y min-h-[44px]";
  const primaryBtn = "flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryBtn = "flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium bg-[#333333] border border-[#444] text-[#EEEEEE] hover:bg-[#444444] transition-colors shadow-sm cursor-pointer";
  const typeSelectBtn = "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[#444] bg-[#2A2A2A] text-[#CCC] hover:bg-[#333] hover:text-white transition-colors cursor-pointer";

  return (
    <>
      {!loginPopUp && (
        <div className="flex flex-col items-center w-full min-h-screen text-[#EEEEEE] pb-20">
          
          <div className="sticky top-16 z-40 flex flex-col sm:flex-row items-center justify-between w-full px-4 sm:px-8 py-4 bg-[#111111]/90 backdrop-blur-md border-b border-[#333333] gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-[#EEEEEE]">Manual Entry</h1>
              <div className="h-4 w-px bg-[#444] hidden sm:block"></div>
              <span className="text-sm text-[#888] hidden sm:block">Drafting {details.length} question{details.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="p-2 text-[#AAAAAA] hover:text-[#EF4444] transition-colors bg-[#222] border border-[#333] rounded-md" onClick={clearEveryThing} title="Clear All">
                <RefreshCcw size={18} />
              </button>
              
              <button 
                className={secondaryBtn} 
                onClick={saveData} 
                disabled={isLoading.clickType !== undefined}
              >
                {isLoading.clickType === 'save' ? <Loader type="small" /> : <Save size={18} />}
                <span className="hidden sm:inline">{isLoading.clickType === 'save' ? 'Saving...' : 'Save Draft'}</span>
              </button>

              <button 
                className={primaryBtn} 
                onClick={saveAndNext} 
                disabled={isLoading.clickType !== undefined}
              >
                {isLoading.clickType === 'saveandnext' ? <Loader type="small" /> : <MoveRight size={18} />}
                <span>{isLoading.clickType === 'saveandnext' ? 'Processing...' : 'Save & Next'}</span>
              </button>
            </div>
          </div>

          {isLoading.data && (
            <div className="flex w-full items-center justify-center py-20">
              <Loader type="big" />
            </div>
          )}

          {!isLoading.data && (
            <div className="flex flex-col items-start px-4 sm:px-8 py-6 gap-6 w-full max-w-5xl">
              {details.map((question, index) => (
                <div className="w-full flex flex-col gap-2" key={index}>
                  
                  {question.err?.status === true && (
                    <div className="flex items-center gap-2 text-[#EF4444] text-sm font-medium bg-[#EF4444]/10 border border-[#EF4444]/20 p-2 rounded-md">
                      <TriangleAlert size={16} />
                      <span>{question.err.message}</span>
                    </div>
                  )}

                  <div className="bg-[#222222] border border-[#333333] rounded-lg shadow-sm overflow-hidden flex flex-col transition-all">
                    
                    <div 
                      className="flex items-center justify-between w-full p-4 bg-[#1A1A1A] border-b border-[#333333] cursor-pointer hover:bg-[#252525] transition-colors"
                      onClick={() => {
                        const newMinState = !question.minQuestion;
                        handleQuestionView(index, newMinState);
                        checkOnClose(index, newMinState);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#DE5833]/10 text-[#DE5833] font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-[#EEEEEE]">
                            {question.minQuestion && question.question.trim() !== "" 
                              ? (question.question.length > 60 ? `${question.question.substring(0, 60)}...` : question.question) 
                              : 'Question Details'}
                          </span>
                          
                          {question.onCloseError === true && (
                            <span className="text-xs text-[#EF4444] mt-0.5">Missing required fields</span>
                          )}
                          {question.onCloseError === false && (
                            <span className="text-xs text-green-500 mt-0.5">Ready</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {question.type && (
                          <span className="hidden sm:inline-flex px-2 py-1 bg-[#333] text-[#AAA] rounded text-xs capitalize border border-[#444]">
                            {question.type}
                          </span>
                        )}
                        <button className="text-[#888] hover:text-[#EEE]">
                          {question.minQuestion ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </button>
                      </div>
                    </div>

                    {!question.minQuestion && (
                      <div className="flex flex-col p-5 gap-5">
                        
                        <div className="flex flex-col gap-2">
                          <label htmlFor={`question${index}`} className="text-sm font-medium text-[#AAAAAA]">
                            Prompt / Question Text
                          </label>
                          <textarea 
                            id={`question${index}`} 
                            placeholder="Enter your question here..." 
                            className={inputStyles} 
                            value={question.question} 
                            onChange={(e) => handleQuestionChange(index, e)}
                          />
                        </div>

                        {question.type === "" ? (
                          <div className="flex flex-col gap-2 pt-2 border-t border-[#333]">
                            <span className="text-sm font-medium text-[#AAAAAA]">Select Answer Format</span>
                            <div className="flex flex-wrap items-center gap-2">
                              <button className={typeSelectBtn} onClick={() => handleTypeChange(index, "option")}>
                                <List size={16} /> Multiple Choice
                              </button>
                              <button className={typeSelectBtn} onClick={() => handleTypeChange(index, "checkbox")}>
                                <CheckSquare size={16} /> Checkboxes
                              </button>
                              <button className={typeSelectBtn} onClick={() => handleTypeChange(index, "textfield")}>
                                <AlignLeft size={16} /> Text Field
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-4 border-t border-[#333]">
                            <h3 className="text-base font-medium text-[#EEEEEE]">Answers</h3>
                            <button className="text-xs text-[#DE5833] hover:underline" onClick={() => handleCurrentTypeChange(index)}>
                              Change Format
                            </button>
                          </div>
                        )}

                        {question.type !== "" && question.type !== "textfield" && (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs text-[#888] bg-[#1A1A1A] p-2 rounded border border-[#333]">
                              <Info size={14} className="text-[#DE5833]" />
                              <span>Select the indicator on the left to mark the correct answer(s).</span>
                            </div>

                            <div className="flex flex-col gap-3 mt-2">
                              {question.options.map((option, index2) => {
                                if (String(option.value).toLowerCase() === "n/a") return null;
                                
                                const isRadio = question.type === 'option';
                                
                                return (
                                  <div className="flex items-start gap-3 w-full group" key={index2}>
                                    
                                    <button 
                                      className={`mt-2.5 shrink-0 flex items-center justify-center w-5 h-5 border transition-colors ${isRadio ? "rounded-full" : "rounded-sm"} ${option.answer ? "bg-[#DE5833] border-[#DE5833] text-white" : "border-[#666] bg-[#1A1A1A] group-hover:border-[#888]"}`}
                                      onClick={() => handleAnswerChange(index, index2)}
                                      title="Mark as correct answer"
                                    >
                                      {option.answer && <Check size={14} strokeWidth={3} />}
                                    </button>
                                    
                                    <textarea 
                                      placeholder={`Option ${index2 + 1}`} 
                                      className={optionInputStyles} 
                                      onChange={(e) => handleOptionChange(index, index2, e)} 
                                      value={option.value}
                                    />
                                    
                                    <div className="flex flex-col gap-1 mt-1">
                                      <button className="p-1.5 text-[#888] hover:text-[#DE5833] hover:bg-[#333] rounded transition-colors" onClick={() => handleAddOptions(index, index2)} title="Add option below">
                                        <Plus size={16} />
                                      </button>
                                      {index2 !== 0 && (
                                        <button className="p-1.5 text-[#888] hover:text-[#EF4444] hover:bg-[#333] rounded transition-colors" onClick={() => handleDeleteOptions(index, index2)} title="Delete option">
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {question.type === 'textfield' && (
                          <div className="flex items-start gap-2 text-sm text-[#AAAAAA] bg-[#1A1A1A] p-3 rounded-md border border-[#333]">
                            <Info size={18} className="text-[#DE5833] mt-0.5 shrink-0" />
                            <p>Text fields require manual evaluation. The user will be provided with a text box to type their response.</p>
                          </div>
                        )}

                      </div>
                    )}
                    
                    {!question.minQuestion && (
                      <div className="flex items-center justify-end gap-3 p-3 bg-[#1A1A1A] border-t border-[#333333]">
                        {index !== 0 && (
                          <button 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#AAAAAA] hover:text-[#EF4444] hover:bg-[#2A2A2A] rounded transition-colors"
                            onClick={() => handleDeleteQuestion(index)}
                          >
                            <Trash2 size={14} /> Remove Question
                          </button>
                        )}
                        <button 
                          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-[#333] text-[#EEE] hover:bg-[#444] border border-[#444] rounded transition-colors"
                          onClick={() => { checkOnClose(index, true); verifyPrevQuestion(index, true); }}
                        >
                          <Plus size={14} /> Add Next Question
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              ))}
              
              <button 
                className="w-full flex flex-col items-center justify-center p-6 mt-4 gap-2 border-2 border-dashed border-[#444] rounded-lg text-[#888] hover:text-[#DE5833] hover:border-[#DE5833] hover:bg-[#DE5833]/5 transition-all"
                onClick={() => handleAddQuestion(details.length - 1)}
              >
                <CirclePlus size={28} />
                <span className="font-medium">Append New Question</span>
              </button>

            </div>
          )}
        </div>
      )}
      
      {loginPopUp && !isLoading.data && <LoginPopUp />}
    </>
  );
}