import { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { getQuizz } from "../api/quizzApi";
import { getSettings } from "../api/settingApi";
import { validateUser } from "../api/reCalls";
import { Info, X } from "lucide-react";
import LoginPopUp from '../components/LoginPopUp'
import Loader from '../components/Loader';
import { useNavigate } from "react-router-dom";

export default function Test() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const quizzId = path[path.length - 1];
  const [details, setDetails] = useState(null);
  const [settings, setSettings] = useState(null);
  const { setIsStop } = useOutletContext();
  const defaultPopUp = {
    fullScreen: false,
    start: false
  }
  const defaultLoading = {
    data: false,
    requriements: false
  }
  const defaultPass = {
    requriements: false
  }
  const [isPopUpOpen, setIsPopUpOpen] = useState(defaultPopUp);
  const [isPass, setIsPass] = useState(defaultPass);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [loginPopUp, setLoginPopUp] = useState(false);
  const [enterPassword , setEnterPassword] = useState("");

  useEffect(() => {
    check();
    getDetails();
  }, []);
  async function check() {
    setIsLoading({ ...defaultLoading, data: true });
    const ans = await validateUser();
    if (ans === false) {
      localStorage.setItem("link", location.pathname);
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
      if (response.data) {
        const settingId = response.data.settings;
        const response2 = await getSettings(settingId);
        if (response2.data) {
          setSettings(response2.data);
          setDetails(response.data);
          console.log(response.data);
          console.log(response2.data);
        } else {
          toast.error(response2.message);
        }
      } else {
        toast.error(response.message);
      }

    }
    setIsLoading({ ...defaultLoading, data: false });
  }
 
  const testingRequirements = () => {
    setIsLoading({ ...defaultLoading, requriements: true });
    let timeout = null;
    clearTimeout(timeout);
    timeout = setTimeout(()=> {
      setIsPass({...defaultPass , requriements: true});
      setIsLoading({ ...defaultLoading, requriements: false });
      clearTimeout(timeout);
      toast.success("Verified,Click on the Start!")
    },2000);
  }

  const handleStartTest = () => {
    setIsStop(true);
    setIsPopUpOpen({...defaultPopUp , start: true});
  }

  const handlePasswordCheck = () => {
    if(details.password.trim() === enterPassword.trim()) {
      setIsStop(false);
      setIsPopUpOpen({...defaultPopUp , start: false});
      navigate(`/quizz/test/start/${details._id}` , {
        state: "yes"
      });
    }else {
      toast.info("Password is incorrect!");
    }
  }

  return (
    <>
      {!loginPopUp && <div className={`relative pt-5 px-2 flex flex-col gap-5 items-start  ${ isPopUpOpen.start? "opacity-50" : ""}`}>
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          <div className="flex flex-col gap-1 items-center">
            <h1 className="text-2xl text-[#ff9100] text-center">Welcome to the Test.</h1>
            <div className="border w-20 border-white"></div>
          </div>
          <div className={`w-max flex items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.requriements ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} disabled={isLoading.requriements} onClick={testingRequirements}>
            {!isLoading.requriements && <span>Test the Requirements</span>}
            {isLoading.requriements && <>
              <span>
                <Loader type="very small" />
              </span>
              <span>Testing....</span>
            </>}
          </div>
        </div>
        <div>
          {!isLoading.requriements && <div className="flex items-center gap-1 text-orange-500">
            <span><Info size={18} /></span>
            <span>Click the Button Test the Requirements,Before Starting Quizze</span>
          </div>}
        </div>

        <div className="flex flex-col gap-2 items-center justify-center w-full">
          <div className="flex flex-col gap-1 items-center">
            <h1 className="text-2xl text-[#ff9100] text-center">Quizze Details</h1>
            <div className="border w-20 border-white"></div>
          </div>
          {details && settings &&
            <div className="flex flex-col items-start gap-2 text-white w-full">
              <span>Quizz Name: <span className="text-yellow-400 text-xl">{details && details.name}</span></span>
              <span>Creator Name: <span className="text-yellow-400 text-xl">{details && details.user.name}</span></span>
              <span>Creator on: <span className="text-yellow-400 text-xl">{details && details.created_on.day}</span></span>
              <span>Accessed between: <span className="text-yellow-400 text-xl">{settings && new Date(settings.access.date.start).toLocaleDateString()} to {new Date(settings.access.date.end).toLocaleDateString()}</span></span>
              <span>Duration: <span className="text-yellow-400 text-xl">{settings && settings.access.duration.hrs} Hour {settings.access.duration.minutes} Minutes</span></span>
              {settings.evalution.award.status && <span>Marks: <span className="text-yellow-400 text-xl">Correct Marks: {settings && settings.evalution.award.correct} <br /> Wrong Marks: {settings.evalution.award.correct} </span></span>}
              <span>Full Screen: <span className="text-yellow-400 text-xl">{settings.security.fullScreen ? "On" : "Off"}</span></span>
              <span>Video: <span className="text-yellow-400 text-xl">{settings.security.video ? "On" : "Off"}</span></span>
              <span>Instructions: <span className="text-yellow-400 text-xl">{settings.security.instructions.status ? "Provided" : "Not Provided"}</span></span>
              {settings.security.instructions.status && <div className="flex items-center text-xl text-orange-500 border border-gray-500 rounded-md p-1 w-full bg-gray-600/50 wrap-break-words whitespace-normal">{settings.security.instructions.data}</div>}
            </div>
          }
        </div>
        <div className="flex w-full items-end justify-end">
          <div className={`w-max flex items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${!isPass.requriements ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} disabled={!isPass.requriements} onClick={()=>handleStartTest()}>
            <span>Start</span>
          </div>
        </div>
      </div>}
      {isPopUpOpen.start && <div className="absolute z-10 top-50 flex items-center justify-center w-full">
        <div className="">
          <div className="flex items-start flex-col gap-1 max-w-90 text-white p-1 border rounded-md px-2 bg-[#0B1020]">
            <div className="flex items-center justify-between w-full border-b">
              <span className="text-orange-600 text-lg">Requirement</span>
              <span className="cursor-pointer" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, start: false
                }); setIsStop(false);
              }}><X size={20} /></span>
            </div>
            <div className="py-3">
              <span>Enter the Password</span>
              <input type="text" className='border outline-none p-1 rounded-sm bg-white/90 w-full text-black' onChange={(e) => setEnterPassword(e.target.value)} value={enterPassword}/>
            </div>
            <div className="flex items-center justify-between w-full">
              <button className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#838186] text-white hover:bg-[#8d8d8e]" onClick={() => {
                setIsPopUpOpen({
                  ...defaultPopUp, start: false
                }); setIsStop(false); 
              }}>Cancel</button>
              <label className="flex items-center justify-center p-1 cursor-pointer transition border borde-gray-200 rounded-sm font-semibold bg-[#ff0000] text-white hover:bg-[#ab2424]">
                <span className="flex items-center gap-1" onClick={() => handlePasswordCheck()}>Check</span>
              </label>
            </div>
          </div>
        </div>
      </div>}
      {
        loginPopUp && <LoginPopUp />
      }
    </>
  )
}