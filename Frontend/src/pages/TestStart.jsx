import { useEffect, useState } from "react";
import { validateUser } from "../api/reCalls";
import { getQuizz } from "../api/quizzApi";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import LoginPopUp from "../components/LoginPopUp";
import { Check, Info, X } from "lucide-react";
import { getSettings } from "../api/settingApi";
import { addTest } from "../api/testApi";
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";


export default function TestStart() {
  const location = useLocation();
  const navigate = useNavigate();
  const isValid = location.state;
  const path = location.pathname.split("/");
  const quizzId = path[path.length - 1];
  const [details, setDetails] = useState(null);
  const startedAt = new Date();
  const defaultPopUp = {
    submit: false,
    cancel: false,
    fullScreen: false
  }
  const defaultLoading = {
    data: false,
    submit: false
  }
  const defaultNumberList = {
    questionNumber: undefined,
    status: false,
    answer: []
  }
  const [isPopUpOpen, setIsPopUpOpen] = useState(defaultPopUp);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [loginPopUp, setLoginPopUp] = useState(false);
  const [numberList, setNumberList] = useState(null);
  const [timer, setTimer] = useState(0);
  const [question, setQuestion] = useState(0);
  const [settings, setSettings] = useState(null);


  useEffect(() => {
    check();
    getDetails();
    checkTime();
    document.addEventListener("contextmenu", menu);
    document.addEventListener("keydown", keydown);
    document.addEventListener("fullscreenchange", full);
  }, []);
  function menu(e) {
    e.preventDefault();
    toast.warn("Right Click is Diasbled");
  }
  function keydown(e) {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      (e.ctrlKey && e.key === "u")
    ) {
      e.preventDefault();
      toast.warn("Some Shorcuts are Diasbled");
    }
  }
  function full(e) {
    if (!document.fullscreenElement) {
      toast.error("Auto submitting the Quizz,Volation!!!!");
      handleFinalSubmit("cancel");
    }
  }
  async function check() {
    setIsLoading({ ...defaultLoading, data: true });
    const ans = await validateUser();
    if (ans === false) {
      toast.error("Plz Login To Use!")
      setLoginPopUp(true);
    } else {
      setLoginPopUp(false);
    }
    setIsLoading({ ...defaultLoading, data: false });
  }
  async function getDetails() {
    setIsLoading({ ...defaultLoading, data: true });
    if (quizzId == null) {
      toast.error("Error in Fetching Quizz.");
      return;
    } else {
      const response = await getQuizz(quizzId);
      const settingId = response.data.settings;
      const response2 = await getSettings(settingId);
      if (response.data && response2.data) {
        setSettings(response2.data);
        setDetails(response.data);
        const numberListDummy = response.data.questions.map((question, index) => {
          const obj = { ...defaultNumberList, questionNumber: index };
          if (question.type !== 'textfield') {
            const updatedOptions = question.options.map((option) => {
              return {
                status: false
              }
            });
            obj.answer = updatedOptions;
          } else {
            obj.answer = "";
          }
          return obj;
        });
        const time = Number(response2.data.access.duration.hrs) * 60 + Number(response2.data.access.duration.minutes);
        console.log(numberListDummy);
        setTimer(time);
        setNumberList(numberListDummy);
        console.log(response.data);
        if (response2.data.security.fullScreen) {
          setIsPopUpOpen({ ...defaultPopUp, fullScreen: true });
        }
      } else {
        toast.error(response.message);
      }
    }
    setIsLoading({ ...defaultLoading, data: false });
  }
  const handleFullScreen = () => {
    setIsPopUpOpen({
      ...defaultPopUp, fullScreen: false
    });
    document.documentElement.requestFullscreen();
  }

  const checkTime = () => {
    let clearTime = null;
    clearInterval(clearTime);

    clearTime = setInterval(() => {

      setTimer((prev) => {
        if (prev - 1 <= 0) {
          clearInterval(clearTime);
          handleFinalSubmit();
        }
        return prev - 1;
      });
    }, 1000 * 60);
  }

  const handleNextButton = () => {
    if (question + 1 === details.questions.length) {
      handleSubmitButton();
    } else {
      setQuestion((prev) => prev + 1);
    }
  }

  const handlePrevButton = () => {
    if (question === 0) {
      return;
    } else {
      setQuestion((prev) => prev - 1);
    }
  }

  const handleSubmitButton = () => {
    setIsPopUpOpen({ ...defaultPopUp, submit: true });
  }

  const handleCancelButton = () => {
    setIsPopUpOpen({ ...defaultPopUp, cancel: true });
  }

  const handleClickAnswer = (type, index, value) => {
    const data = [...numberList];
    if (type === 'option') {
      for (let i = 0; i < data[question].answer.length; i++) {
        data[question].answer[i] = {
          status: false
        }
      }
      data[question].answer[index] = {
        status: value
      }
    } else if (type === 'checkbox') {
      data[question].answer[index] = {
        status: value
      }
    }
    let clicked = false;
    for (let i = 0; i < data[question].answer.length; i++) {
      clicked ||= data[question].answer[i].status;
    }
    data[question].status = clicked;
    setNumberList(data);
  }

  const handleTextChange = (value) => {
    const data = [...numberList];
    data[question].answer = value;
    data[question].status = data[question].answer.trim().length !== 0;
    setNumberList(data);
  }

  const correctCount = () => {
    let count = 0;
    for (let i = 0; i < numberList.length; i++) {
      if (numberList[i].status) count++;
    }
    return count;
  }

  const wrongCount = () => {
    return details.questions.length - correctCount();
  }
  const handleFinalSubmit = async (value) => {
    setIsLoading({ ...defaultLoading, submit: true });
    if (!value) {
      let marks = 0;
      for (let i = 0; i < details.questions.length; i++) {
        let count = 0;
        let fcount = 0
        for (let j = 0; j < details.questions[i].options.length; j++) {
          if (details.questions[i].type === 'option') {
            if (details.questions[i].options[j].answer && numberList[i].answer[j].status) {
              count++;

            } if (details.questions[i].options[j].answer) {
              fcount++;
            }
          } else if (details.questions[i].type === 'checkbox') {
            if (details.questions[i].options[j].answer && numberList[i].answer[j].status) {
              count++;

            } if (details.questions[i].options[j].answer) {
              fcount++;
            }
          }

        }
        console.log(fcount, count);

        if (fcount === count) {
          marks += (settings.evalution.award.status ? settings.evalution.award.correct : 1);
        } else {
          marks += (settings.evalution.award.status ? -settings.evalution.award.wrong : 0);
        }
      }

      const answers = numberList.map((cur, index) => {
        let answer = []
        if (details.questions[index].type === 'option' || details.questions[index].type === 'checkbox') {
          for (let i = 0; i < cur.answer.length; i++) {
            if (cur.answer[i].status) {
              answer.push(String(i))
            }
          }
        } else {
          answer.push(cur.answer);
        }
        return {
          questionIndex: index,
          answer
        }
      });
      console.log(answers);

      const status = 'completed';
      const response = await addTest({
        user: localStorage.getItem("id"),
        quizz: quizzId,
        answers,
        marks,
        startedAt,
        status,
        submittedAt: new Date()
      });
      if (response.id) {
        toast.success(response.message);
        document.removeEventListener("contextmenu", menu);
        document.removeEventListener("keydown", keydown);
        document.removeEventListener("fullscreenchange", full);
        setIsPopUpOpen({ ...defaultPopUp, submit: false });
        setIsLoading({ ...defaultLoading, submit: false });
        navigate(`/quizz/test/dashboard/${quizzId}`);
      } else {
        toast.error(response.message);

      }
      setIsPopUpOpen({ ...defaultPopUp, submit: false });
      setIsLoading({ ...defaultLoading, submit: false });
    } else {
      const response = await addTest({
        user: localStorage.getItem("id"),
        quizz: quizzId,
        answers: [{ questionIndex: 0, answer: ['nothing'] }],
        marks: 0,
        startedAt,
        status: 'cancelled',
        submittedAt: new Date()
      });
      document.removeEventListener("contextmenu", menu);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("fullscreenchange", full);
      if (response.id) {
        navigate(`/quizz/test/dashboard/${quizzId}`);
        toast.success(response.message);
        setIsPopUpOpen({ ...defaultPopUp, submit: false });
        setIsLoading({ ...defaultLoading, submit: false });
      } else {
        navigate(`/quizz/test/dashboard/${quizzId}`);
        toast.error(response.message);

      }
      setIsPopUpOpen({ ...defaultPopUp, submit: false });
      setIsLoading({ ...defaultLoading, submit: false });
    }

  }

  const handleFinalCancel = () => {
    document.removeEventListener("contextmenu", menu);
    document.removeEventListener("keydown", keydown);
    document.removeEventListener("fullscreenchange", full);
    navigate("/");
  }

  return (
    <>
      {isValid && !loginPopUp && !isLoading.data && details &&
        <div className={`relative flex items-top w-full h-screen ${(isPopUpOpen.submit || isPopUpOpen.cancel || isPopUpOpen.fullScreen) && "opacity-40"}`}>
          {numberList &&
            <div className="bg-[#489dde] flex flex-col gap-6 items-center border-r p-2 h-screen flex-1">
              <div className="flex items-center w-full justify-center sm:justify-between">
                <div className="flex flex-col gap-1 items-center">
                  <h1 className="sm:text-xl text-[#f7fb00] text-center">Questions List</h1>
                  <div className="border w-5 sm:w-20 border-white"></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-5 overflow-auto justify-center">
                {
                  numberList && numberList.map((current, index) => {
                    return <div className={`${current.status ? "bg-green-600 text-white" : "bg-white text-black"} ${question === index ? "border-orange-600" : "border-black"} border-2  w-10 h-10 rounded-full flex items-center justify-center cursor-pointer`} key={index}>
                      {current.questionNumber + 1}
                    </div>
                  })
                }
              </div>
            </div>
          }
          <div className="flex flex-col gap-5 items-start border-r h-screen flex-5 bg-blue-100">
            <div className="border-b w-full p-1 flex items-center justify-between">
              <h1 className="text-lg sm:text-2xl">Quizz Name: <span className="text-orange-700 font-bold">{details.name}</span></h1>
              <h1 className={`${timer <= 5 ? "bg-red-500/90" : "bg-gray-600/90"} border text-white p-1 rounded-md`}>Timer: {timer}</h1>
            </div>
            <div className="flex w-full justify-between items-center p-1">
              <div className={`w-max p-1 border border-gray-200 rounded-sm font-semibold  bg-[#ff0000] text-white hover:bg-[#d92828] cursor-pointer`}
                onClick={handleCancelButton}>Cancel Test</div>
              <div className="w-max p-1 border border-gray-200  rounded-sm font-semibold  bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer float-end" onClick={handleSubmitButton}>Submit Test</div>
            </div>
            <div className="h-screen overflow-auto w-full p-2">
              <div className="w-full">
                <div className="flex items-center text-xl text-black border border-gray-500 rounded-sm p-1 w-full bg-blue-300 wrap-break-words whitespace-normal">{question + 1}. {details.questions[question].question}</div>
                {
                  (details.questions[question].type === "option" || details.questions[question].type === "checkbox") &&
                  <div className="flex flex-col items-start gap-2 p-1">
                    {details.questions[question].type === "checkbox" && <div className="text-orange-600 flex items-center gap-1">
                      <span><Info size={16} /></span>
                      <span>Select all correct answers.</span>
                    </div>}
                    {
                      numberList && details.questions[question].options.map((option, index2) => {
                        if (option.value.trim() !== 'n/a') {
                          return (
                            <div key={index2} className="flex items-center gap-2 w-full">

                              <div className={`border text-black w-4 h-4 ${details.questions[question].type === 'option' ? "rounded-full" : "rounded-sm"} ${numberList[question].answer[index2].status && "bg-green-600"} text-center`} onClick={() => handleClickAnswer(details.questions[question].type, index2, !numberList[question].answer[index2].status)}>
                                {numberList[question].answer[index2].status && <span><Check size={12} /></span>}
                              </div>
                              <div className="flex items-center text-xl text-black border border-gray-500 rounded-sm p-1 w-full bg-blue-300 wrap-break-words whitespace-normal">{option.value}</div>
                            </div>
                          )
                        } else {
                          return ""
                        }
                      })
                    }

                  </div>
                }
                {
                  details.questions[question].type === "textfield" &&
                  <div className="flex flex-col items-start gap-2 py-2"><textarea rows="10" className="outline-none border w-full rounded-md bg-white text-black p-1" placeholder="Enter the Answer" value={numberList[question].answer} onChange={(e) => handleTextChange(e.target.value)}></textarea></div>
                }
              </div>
            </div>
            <div className="flex w-full justify-between items-center p-1">
              <div className={`w-max p-1 border border-gray-200 rounded-sm font-semibold  bg-[#7C3AED] text-white hover:bg-[#6D28D9]  ${question === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} disabled={question === 0}
                onClick={handlePrevButton}>Previous</div>
              <div className="w-max p-1 border border-gray-200  rounded-sm font-semibold  bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer float-end" onClick={handleNextButton}>{question === details.questions.length - 1 ? "Submit" : "Next"}</div>
            </div>
          </div>
        </div>
      }
      {
        isLoading.data && <div className="flex w-full items-center justify-center"><Loader type="big" /></div>
      }
      {
        loginPopUp || !isValid && <LoginPopUp />
      }
      {isPopUpOpen.submit && <div className="absolute z-10 top-50 flex items-center justify-center w-full">
        <div className="">
          <div className="flex items-start flex-col gap-1 max-w-90 text-white p-1 border rounded-md px-2 bg-[#0B1020]">
            <div className="flex items-center justify-between w-full border-b">
              <span className="text-orange-600 text-lg">Information</span>
              <span className="cursor-pointer" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, submit: false
                });
              }}><X size={20} /></span>
            </div>
            <div className="py-3 flex flex-col items-start gap-2">
              <span>Your Submitting the Quizze,There is no Re-take,After Submission</span>
              <div className="flex items-center flex-wrap gap-2 w-full">
                <span className="text-green-600">{correctCount()} Marked</span>
                <span className="text-red-600">{wrongCount()} Not visited/Un Marked</span>
              </div>

            </div>
            <div className="flex items-center justify-between w-full">
              <button className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#838186] text-white hover:bg-[#8d8d8e]" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, submit: false
                });
              }}>Cancel</button>
              <label className={`flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#ff0000] text-white hover:bg-[#ab2424] ${isLoading.submit ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={isLoading.submit}>
                <span className="flex items-center gap-1" onClick={() => handleFinalSubmit()}>

                  <span>submit</span>
                  {isLoading.submit && <Loader type="very small" />}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>}
      {isPopUpOpen.cancel && <div className="absolute z-10 top-50 flex items-center justify-center w-full">
        <div className="">
          <div className="flex items-start flex-col gap-1 max-w-90 text-white p-1 border rounded-md px-2 bg-[#0B1020]">
            <div className="flex items-center justify-between w-full border-b">
              <span className="text-orange-600 text-lg">Information</span>
              <span className="cursor-pointer" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, cancel: false
                });
              }}><X size={20} /></span>
            </div>
            <div className="py-3 flex flex-col items-start gap-2">
              <span>Your Canceling the Test,Results Will Not be Evaluted</span>
              <div className="flex items-center flex-wrap gap-2 w-full">
                <span className="text-green-600">{correctCount()} Marked</span>
                <span className="text-red-600">{wrongCount()} Not visited/Un Marked</span>
              </div>

            </div>
            <div className="flex items-center justify-between w-full">
              <button className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#838186] text-white hover:bg-[#8d8d8e]" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, cancel: false
                });
              }}>Cancel</button>
              <label className={`flex items-center justify-center p-1  transition border borde-gray-200 rounded-sm font-semibold bg-[#ff0000] text-white hover:bg-[#ab2424]
                    `}>
                <span className={`flex items-center gap-1`} onClick={() => handleFinalCancel()}
                >submit</span>
              </label>
            </div>
          </div>
        </div>
      </div>}
      {isPopUpOpen.fullScreen && <div className="absolute z-10 top-50 flex items-center justify-center w-full">
        <div className="">
          <div className="flex items-start flex-col gap-1 max-w-90 text-white p-1 border rounded-md px-2 bg-[#0B1020]">
            <div className="flex items-center justify-between w-full border-b">
              <span className="text-orange-600 text-lg">Important!!!</span>
              {/* <span className="cursor-pointer" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, fullScreen: false
                }); setIsStop(false); setIsLoading({ ...defaultLoading, requriements: false });
                toast.info("Without Enabling,Quizz Cannot be Continued")
              }}><X size={20} /></span> */}
            </div>
            <div className="py-3">Your Entering into Full Screen Mode,Donot Exist the Full Screen Mode,<span className="text-red-600">If Exited,The Quizz Will be Cancled Immediately.</span>
            </div>
            <div className="flex items-center justify-between w-full">
              {/* <button className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#838186] text-white hover:bg-[#8d8d8e]" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, fullScreen: false
                }); setIsStop(false); setIsLoading({ ...defaultLoading, requriements: false });
                toast.info("Without Enabling,Quizz Cannot be Continued")
              }}>Cancel</button> */}
              <label className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#ff0000] text-white hover:bg-[#ab2424]">
                <span className="flex items-center gap-1" onClick={() => handleFullScreen()}>Ok</span>
              </label>
            </div>
          </div>
        </div>
      </div>}
    </>
  )
}