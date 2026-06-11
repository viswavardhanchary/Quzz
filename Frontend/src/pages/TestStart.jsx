import { useEffect, useState, useRef } from "react";
import { validateUser } from "../api/reCalls";
import { getQuizz } from "../api/quizzApi";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import LoginPopUp from "../components/LoginPopUp";
import { Check, Info, X, Camera, Clock, AlertTriangle, LayoutGrid, AlertCircle, ShieldAlert } from "lucide-react";
import { getSettings } from "../api/settingApi";
import { addTest } from "../api/testApi";
import { toast } from 'react-toastify';

export default function TestStart() {
  const location = useLocation();
  const navigate = useNavigate();
  const isValid = location.state;
  const path = location.pathname.split("/");
  const quizzId = path[path.length - 1];
  
  const [details, setDetails] = useState(null);
  const [settings, setSettings] = useState(null);
  const [numberList, setNumberList] = useState(null);
  
  const [timer, setTimer] = useState(0); 
  const [totalSeconds, setTotalSeconds] = useState(0);
  
  const [question, setQuestion] = useState(0);
  const [loginPopUp, setLoginPopUp] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState({ submit: false, cancel: false, fullScreen: false });
  const [isLoading, setIsLoading] = useState({ data: false, submit: false });

  const MAX_TAB_SWITCHES = 3;
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cameraWarning, setCameraWarning] = useState(null); 
  const [showPreview, setShowPreview] = useState(true);
  const videoRef = useRef(null);

  const handleFinalSubmitRef = useRef(null);

  const userId = localStorage.getItem("id") || "STUDENT";
  
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250"><text x="50%" y="50%" transform="rotate(-45 125 125)" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="rgba(255, 255, 255, 0.08)">${userId}</text></svg>`;
  const encodedSvg = btoa(unescape(encodeURIComponent(svgString))); 
  const watermarkStyle = { 
    backgroundImage: `url("data:image/svg+xml;base64,${encodedSvg}")`,
    backgroundRepeat: 'repeat',
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    zIndex: 9999 
  };

  useEffect(() => {
    check();
    getDetails();
    document.addEventListener("contextmenu", menu);
    document.addEventListener("keydown", keydown);
    document.addEventListener("fullscreenchange", full);
    
    return () => {
      document.removeEventListener("contextmenu", menu);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("fullscreenchange", full);
    };
  }, []);

  useEffect(() => {
    handleFinalSubmitRef.current = handleFinalSubmit;
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && details && settings) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= MAX_TAB_SWITCHES) {
            toast.error("Maximum tab switches exceeded. Test cancelled.");
            if (handleFinalSubmitRef.current) handleFinalSubmitRef.current("cancel");
          } else {
            toast.warn(`⚠️ Warning: Do not switch tabs! (${newCount}/${MAX_TAB_SWITCHES})`);
          }
          return newCount;
        });
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [details, settings]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraWarning(null); 

      stream.getVideoTracks()[0].onended = () => {
        if (cameraWarning === null) setCameraWarning(10);
      };
      return true;
    } catch (err) {
      if (cameraWarning === null) setCameraWarning(10);
      return false;
    }
  };

  useEffect(() => {
    if (settings?.security?.video) {
      startCamera();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  }, [settings]);

  useEffect(() => {
    let interval;
    if (cameraWarning !== null) {
      if (cameraWarning <= 0) {
        toast.error("Camera disconnected for too long. Test cancelled.");
        if (handleFinalSubmitRef.current) handleFinalSubmitRef.current("cancel");
        setCameraWarning(null);
      } else {
        interval = setInterval(async () => {
          setCameraWarning(prev => prev - 1);
          const reconnected = await startCamera();
          if (reconnected) setCameraWarning(null);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [cameraWarning]);

  useEffect(() => {
    let intervalId;
    if (timer > 0 && !isPopUpOpen.submit && !isPopUpOpen.cancel) {
      intervalId = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer <= 0 && totalSeconds > 0 && !isLoading.submit && !isPopUpOpen.cancel) {
      handleFinalSubmit();
    }
    return () => clearInterval(intervalId);
  }, [timer, isPopUpOpen.submit, isPopUpOpen.cancel, totalSeconds]);

  function menu(e) {
    if(path[path.length-1] !== 'start') return ;
    e.preventDefault();
    toast.warn("Right Click is Disabled");
  }
  
  function keydown(e) {
    if(path[path.length-1] !== 'start') return ;
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      (e.ctrlKey && e.key === "u")
    ) {
      e.preventDefault();
      toast.warn("Some Shortcuts are Disabled");
    }
  }
  
  function full(e) {
    if(path[path.length-1] !== 'start') return ;
    if (!document.fullscreenElement) {
      toast.error("Auto submitting the Quiz, Violation!!!!");
      handleFinalSubmit("cancel");
    }
  }

  async function check() {
    setIsLoading(prev => ({ ...prev, data: true }));
    const ans = await validateUser();
    if (ans === false) {
      toast.error("Please Login To Use!");
      setLoginPopUp(true);
    } else {
      setLoginPopUp(false);
    }
    setIsLoading(prev => ({ ...prev, data: false }));
  }

  async function getDetails() {
    setIsLoading(prev => ({ ...prev, data: true }));
    if (quizzId == null) {
      toast.error("Error Fetching Quiz.");
      return;
    } 
    const response = await getQuizz(quizzId);
    const settingId = response.data?.settings;
    if(!settingId) return;
    const response2 = await getSettings(settingId);
    
    if (response.data && response2.data) {
      localStorage.setItem('date', JSON.stringify(new Date()));
      setSettings(response2.data);
      setDetails(response.data);
      
      const numberListDummy = response.data.questions.map((q, index) => {
        const obj = { questionNumber: index, status: false, answer: [] };
        if (q.type !== 'textfield') {
          obj.answer = q.options.map(() => ({ status: false }));
        } else {
          obj.answer = "";
        }
        return obj;
      });
      setNumberList(numberListDummy);

      const timeInSecs = (Number(response2.data.access.duration.hrs) * 3600) + (Number(response2.data.access.duration.minutes) * 60);
      setTimer(timeInSecs);
      setTotalSeconds(timeInSecs);

      if (response2.data.security.fullScreen) {
        setIsPopUpOpen(prev => ({ ...prev, fullScreen: true }));
      }
    } else {
      toast.error(response.message);
    }
    setIsLoading(prev => ({ ...prev, data: false }));
  }

  const handleFullScreen = () => {
    setIsPopUpOpen(prev => ({ ...prev, fullScreen: false }));
    document.documentElement.requestFullscreen();
  }

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const handleNextButton = () => {
    if (question + 1 === details.questions.length) handleSubmitButton();
    else setQuestion((prev) => prev + 1);
  }

  const handlePrevButton = () => {
    if (question > 0) setQuestion((prev) => prev - 1);
  }

  const handleSubmitButton = () => setIsPopUpOpen(prev => ({ ...prev, submit: true }));
  const handleCancelButton = () => setIsPopUpOpen(prev => ({ ...prev, cancel: true }));

  const handleClickAnswer = (type, index, value) => {
    const data = [...numberList];
    if (type === 'option') {
      data[question].answer.forEach(a => a.status = false);
      data[question].answer[index] = { status: value };
    } else if (type === 'checkbox') {
      data[question].answer[index] = { status: value };
    }
    data[question].status = data[question].answer.some(a => a.status);
    setNumberList(data);
  }

  const handleTextChange = (value) => {
    const data = [...numberList];
    data[question].answer = value;
    data[question].status = data[question].answer.trim().length !== 0;
    setNumberList(data);
  }

  const correctCount = () => numberList.filter(n => n.status).length;
  const wrongCount = () => details.questions.length - correctCount();

  const handleFinalSubmit = async (value) => {
    setIsLoading(prev => ({ ...prev, submit: true }));

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    if (!value) {
      let marks = 0;
      for (let i = 0; i < details.questions.length; i++) {
        let count = 0, fcount = 0;
        for (let j = 0; j < details.questions[i].options.length; j++) {
          if (details.questions[i].options[j].answer && numberList[i].answer[j].status) count++;
          if (details.questions[i].options[j].answer) fcount++;
        }
        if (fcount === count && fcount !== 0) {
          marks += (settings.evalution.award.status ? settings.evalution.award.correct : 1);
        } else {
          marks += (settings.evalution.award.status ? -settings.evalution.award.wrong : 0);
        }
      }

      const answers = numberList.map((cur, index) => {
        let answer = []
        if (details.questions[index].type === 'option' || details.questions[index].type === 'checkbox') {
          cur.answer.forEach((a, i) => { if (a.status) answer.push(String(i)) });
        } else {
          answer.push(cur.answer);
        }
        return { questionIndex: index, answer }
      });

      const response = await addTest({
        user: localStorage.getItem("id"),
        quizz: quizzId,
        answers,
        marks,
        startedAt: JSON.parse(localStorage.getItem('date')),
        status: 'completed',
        submittedAt: new Date()
      });
      
      if (response.id) {
        toast.success(response.message);
        navigate(`/quizz/test/dashboard/${quizzId}`);
      } else toast.error(response.message);
    } else {
      const response = await addTest({
        user: localStorage.getItem("id"),
        quizz: quizzId,
        answers: [{ questionIndex: 0, answer: ['nothing'] }],
        marks: 0,
        startedAt: JSON.parse(localStorage.getItem('date')),
        status: 'cancelled',
        submittedAt: new Date()
      });
      if (response.id) {
        navigate(`/quizz/test/dashboard/${quizzId}`);
        toast.success("Test was Cancelled.");
      } else toast.error(response.message);
    }
    setIsPopUpOpen({ submit: false, cancel: false, fullScreen: false });
    setIsLoading(prev => ({ ...prev, submit: false }));
  }

  const isTimeBlinking = totalSeconds > 0 && timer <= (totalSeconds * 0.1);

  return (
    <>
      {cameraWarning !== null && (
        <div className="fixed inset-0 z-100000 bg-black/95 flex flex-col items-center justify-center text-[#EEEEEE] p-5 text-center backdrop-blur-md">
           <ShieldAlert size={80} className="text-[#EF4444] mb-6" />
           <h1 className="text-4xl font-bold mb-4">Camera Disconnected</h1>
           <p className="text-xl mb-2 text-[#CCCCCC]">Please plug in or allow access to your camera immediately.</p>
           <p className="text-lg text-[#888888]">This assessment requires active video monitoring.</p>
           <p className="text-2xl mt-8">Auto-cancelling in <strong className="text-5xl mx-2 text-[#EF4444]">{cameraWarning}</strong> seconds...</p>
        </div>
      )}

      {settings?.security?.video && (
        <div className={`fixed bottom-6 right-6 z-5000 bg-[#1A1A1A] shadow-2xl border border-[#444] overflow-hidden transition-all duration-300 ${showPreview ? 'w-64 h-48 rounded-lg' : 'w-14 h-14 rounded-full cursor-pointer hover:border-[#DE5833]'}`} onClick={() => !showPreview && setShowPreview(true)}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-200 ${showPreview ? 'opacity-100' : 'opacity-0 absolute'}`} 
          />
          
          {!showPreview && (
            <div className="absolute inset-0 flex items-center justify-center text-[#AAAAAA] hover:text-[#EEEEEE] transition-colors" title="Show Camera">
              <Camera size={24} />
            </div>
          )}

          {showPreview && (
            <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 cursor-pointer z-10 text-[#AAAAAA] hover:text-white hover:bg-[#EF4444] transition-colors" onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}>
              <X size={14} strokeWidth={3} />
            </div>
          )}
        </div>
      )}

      {isValid && !loginPopUp && !isLoading.data && details && (
        <div className={`flex w-full h-screen bg-[#111111] text-[#EEEEEE] overflow-hidden relative ${(isPopUpOpen.submit || isPopUpOpen.cancel || isPopUpOpen.fullScreen) ? "opacity-40 pointer-events-none" : ""}`}>
          
          <div style={watermarkStyle}></div>

          {numberList && (
            <div className="w-20 sm:w-64 shrink-0 bg-[#1A1A1A] border-r border-[#333333] flex flex-col h-screen z-10 shadow-lg">
              <div className="p-4 border-b border-[#333333] bg-[#222222] flex items-center gap-3">
                <LayoutGrid className="text-[#DE5833]" size={20} />
                <h2 className="hidden sm:block font-semibold text-[#EEEEEE]">Question Grid</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 content-start">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 justify-items-center sm:justify-items-start">
                  {numberList.map((current, index) => (
                    <button 
                      key={index} 
                      onClick={() => setQuestion(index)}
                      className={`
                        w-10 h-10 rounded text-sm font-bold flex items-center justify-center transition-all
                        ${question === index ? "ring-2 ring-offset-2 ring-offset-[#1A1A1A] ring-[#DE5833]" : ""}
                        ${current.status ? "bg-[#DE5833] text-white border border-[#DE5833]" : "bg-[#222222] text-[#888888] border border-[#444444] hover:bg-[#333333] hover:text-[#EEEEEE]"}
                      `}
                    >
                      {current.questionNumber + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden sm:flex flex-col p-4 border-t border-[#333333] bg-[#222222] gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[#AAAAAA]"><div className="w-3 h-3 bg-[#DE5833] rounded-sm"></div> Answered</span>
                  <span className="font-semibold text-[#EEEEEE]">{correctCount()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[#AAAAAA]"><div className="w-3 h-3 bg-[#222222] border border-[#444444] rounded-sm"></div> Pending</span>
                  <span className="font-semibold text-[#EEEEEE]">{wrongCount()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col h-screen relative z-10 bg-[#111111]">
            
            <div className="h-16 shrink-0 border-b border-[#333333] bg-[#1A1A1A] flex items-center justify-between px-6">
              <h1 className="text-lg font-semibold text-[#EEEEEE] truncate max-w-lg">
                {details.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-md border font-mono font-medium transition-colors duration-300 ${isTimeBlinking ? "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444] animate-pulse" : "bg-[#222222] border-[#444444] text-[#EEEEEE]"}`}>
                  <Clock size={16} />
                  <span>{formatTime(timer)}</span>
                </div>
                <button 
                  className="px-4 py-1.5 text-sm font-medium text-[#AAAAAA] hover:text-[#EF4444] transition-colors"
                  onClick={handleCancelButton}
                >
                  Cancel Test
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-10">
              <div className="w-full max-w-4xl mx-auto">
                
                <div className="mb-8">
                  <div className="flex items-start text-xl sm:text-2xl font-medium text-[#EEEEEE] leading-relaxed">
                    <span className="text-[#888888] mr-3 font-semibold">{question + 1}.</span> 
                    {details.questions[question].question}
                  </div>
                </div>
                
                {(details.questions[question].type === "option" || details.questions[question].type === "checkbox") && (
                  <div className="flex flex-col gap-4 mt-6">
                    {details.questions[question].type === "checkbox" && (
                      <div className="flex items-center gap-2 text-sm text-[#AAAAAA] bg-[#1A1A1A] border border-[#333333] p-3 rounded-md mb-2 w-max">
                        <Info size={16} className="text-[#DE5833]" />
                        <span>Select all correct answers for this question.</span>
                      </div>
                    )}
                    
                    {numberList && details.questions[question].options.map((option, index2) => {
                      if (option.value.trim() !== 'n/a') {
                        const isSelected = numberList[question].answer[index2].status;
                        const isRadio = details.questions[question].type === 'option';
                        
                        return (
                          <div 
                            key={index2} 
                            className={`flex items-center gap-4 w-full p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? "border-[#DE5833] bg-[#DE5833]/10" : "border-[#333333] bg-[#222222] hover:border-[#555555]"}`} 
                            onClick={() => handleClickAnswer(details.questions[question].type, index2, !isSelected)}
                          >
                            <div className={`flex shrink-0 items-center justify-center border-2 w-6 h-6 transition-colors ${isRadio ? "rounded-full" : "rounded-sm"} ${isSelected ? "bg-[#DE5833] border-[#DE5833] text-white" : "border-[#555555] bg-transparent"}`}>
                              {isSelected && <Check size={14} strokeWidth={3} />}
                            </div>
                            <div className={`text-base leading-relaxed ${isSelected ? "text-[#EEEEEE] font-medium" : "text-[#CCCCCC]"}`}>
                              {option.value}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                {details.questions[question].type === "textfield" && (
                  <div className="flex flex-col gap-2 mt-6 w-full">
                    <textarea 
                      rows="8" 
                      className="w-full bg-[#1A1A1A] border border-[#444] rounded-lg p-4 text-[#EEEEEE] placeholder-[#666] outline-none focus:border-[#DE5833] focus:ring-1 focus:ring-[#DE5833] transition-all resize-y text-base" 
                      placeholder="Type your detailed answer here..." 
                      value={numberList[question].answer} 
                      onChange={(e) => handleTextChange(e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
            
            <div className="shrink-0 flex w-full justify-between items-center p-4 bg-[#1A1A1A] border-t border-[#333333]">
              <button 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${question === 0 ? "bg-[#222222] text-[#555555] cursor-not-allowed border border-[#333333]" : "bg-[#333333] border border-[#444444] text-[#EEEEEE] hover:bg-[#444444]"}`} 
                disabled={question === 0} 
                onClick={handlePrevButton}
              >
                Previous
              </button>
              
              {question === details.questions.length - 1 ? (
                <button 
                  className="flex items-center gap-2 px-8 py-2.5 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm"
                  onClick={handleSubmitButton}
                >
                  Submit Assessment
                </button>
              ) : (
                <button 
                  className="flex items-center gap-2 px-8 py-2.5 rounded-md font-medium bg-[#333333] border border-[#444444] text-[#EEEEEE] hover:bg-[#444444] transition-colors shadow-sm"
                  onClick={handleNextButton}
                >
                  Next Question
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}
      
      {isLoading.data && <div className="fixed inset-0 flex w-full items-center justify-center bg-[#111111]/80 backdrop-blur-sm z-6000"><Loader type="big" /></div>}
      {(loginPopUp || !isValid) && <LoginPopUp />}
      
      {isPopUpOpen.submit && (
        <div className="fixed inset-0 z-6000 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-md text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-2xl">
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <span className="font-semibold text-lg text-[#EEEEEE]">Confirm Submission</span>
              <button className="text-[#AAAAAA] hover:text-white transition-colors" onClick={() => setIsPopUpOpen(prev => ({ ...prev, submit: false }))}><X size={20} /></button>
            </div>
            <div className="py-2 flex flex-col items-start gap-4 w-full">
              <p className="text-[#CCCCCC] text-sm leading-relaxed">Are you sure you want to submit your assessment? You cannot modify your answers after submission.</p>
              <div className="flex items-center justify-between w-full bg-[#1A1A1A] p-4 rounded-lg border border-[#333333]">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-2xl font-bold text-[#10B981]">{correctCount()}</span>
                  <span className="text-xs text-[#888888] uppercase tracking-wide mt-1">Answered</span>
                </div>
                <div className="h-10 w-px bg-[#444444]"></div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-2xl font-bold text-[#F59E0B]">{wrongCount()}</span>
                  <span className="text-xs text-[#888888] uppercase tracking-wide mt-1">Pending</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end w-full gap-3 pt-2 mt-2 border-t border-[#444]">
              <button className="px-4 py-2 rounded-md font-medium text-[#AAAAAA] hover:text-white hover:bg-[#333] transition-colors" onClick={() => setIsPopUpOpen(prev => ({ ...prev, submit: false }))}>Go Back</button>
              <button className={`flex items-center justify-center px-6 py-2 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm ${isLoading.submit ? "opacity-70 cursor-not-allowed" : ""}`} disabled={isLoading.submit} onClick={() => handleFinalSubmit()}>
                {isLoading.submit ? <span className="flex items-center gap-2"><Loader type="very small" /> Submitting...</span> : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isPopUpOpen.cancel && (
        <div className="fixed inset-0 z-6000 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-md text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-2xl">
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <div className="flex items-center gap-2 text-[#EF4444]">
                <AlertTriangle size={20} />
                <span className="font-semibold text-lg">Cancel Assessment</span>
              </div>
              <button className="text-[#AAAAAA] hover:text-white transition-colors" onClick={() => setIsPopUpOpen(prev => ({ ...prev, cancel: false }))}><X size={20} /></button>
            </div>
            <div className="py-2 flex flex-col items-start gap-4 w-full">
              <p className="text-[#CCCCCC] text-sm leading-relaxed">You are about to cancel this test. <strong className="text-[#EF4444]">Your results will not be evaluated and your score will be recorded as 0.</strong></p>
            </div>
            <div className="flex items-center justify-end w-full gap-3 pt-2 mt-2 border-t border-[#444]">
              <button className="px-4 py-2 rounded-md font-medium text-[#AAAAAA] hover:text-white hover:bg-[#333] transition-colors" onClick={() => setIsPopUpOpen(prev => ({ ...prev, cancel: false }))}>Resume Test</button>
              <button className="flex items-center justify-center px-6 py-2 rounded-md font-medium bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shadow-sm" onClick={() => handleFinalSubmit("cancel")}>
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isPopUpOpen.fullScreen && (
        <div className="fixed inset-0 z-6000 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="flex flex-col max-w-lg w-full p-0 border border-[#EF4444] rounded-lg bg-[#1A1A1A] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-center w-full border-b border-[#EF4444]/30 bg-[#EF4444]/10 p-5">
              <ShieldAlert size={28} className="text-[#EF4444] mr-3" />
              <span className="text-[#EF4444] font-bold text-xl uppercase tracking-widest">Strict Monitoring Active</span>
            </div>
            <div className="p-8 flex flex-col items-center text-center gap-6 w-full">
              <p className="text-lg text-[#EEEEEE]">You are entering a strictly monitored Full Screen mode.</p>
              <div className="bg-[#222222] border border-[#444444] p-5 rounded-md w-full">
                  <p className="text-[#EF4444] font-semibold flex items-center justify-center gap-2 mb-2"><AlertCircle size={18} /> Do NOT exit full screen or switch tabs.</p>
                  <p className="text-sm text-[#AAAAAA]">If you leave this screen, your assessment will be immediately cancelled and recorded as a 0.</p>
              </div>
            </div>
            <div className="flex items-center justify-center w-full bg-[#222222] p-5 border-t border-[#333333]">
              <button className="w-full flex items-center justify-center px-6 py-3.5 rounded-md font-bold text-base bg-[#DE5833] text-white hover:bg-[#c94f2e] shadow-sm transition-colors" onClick={() => handleFullScreen()}>
                I Understand, Enter Full Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}