import { useEffect, useState } from "react";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getQuizz } from "../api/quizzApi";
import { getSettings } from "../api/settingApi";
import { validateUser } from "../api/reCalls";
import { Info, X, Check, ShieldCheck, Play, User, Calendar, Clock, Award, Monitor, Video, Lock, AlertCircle, FileText, ShieldAlert } from "lucide-react";
import LoginPopUp from '../components/LoginPopUp';
import Loader from '../components/Loader';

export default function Test() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const quizzId = path[path.length - 1];
  const [details, setDetails] = useState(null);
  const [settings, setSettings] = useState(null);
  const { setIsStop } = useOutletContext();
  
  const defaultPopUp = { fullScreen: false, start: false, noaccess: false };
  const defaultLoading = { data: false, requriements: false };
  const defaultPass = { requriements: false };
  
  const [isPopUpOpen, setIsPopUpOpen] = useState(defaultPopUp);
  const [isPass, setIsPass] = useState(defaultPass);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [loginPopUp, setLoginPopUp] = useState(false);
  const [enterPassword, setEnterPassword] = useState("");

  const [systemChecks, setSystemChecks] = useState({ browser: 'idle', camera: 'idle' });

  useEffect(() => {
    check();
    getDetails();
  }, []);

  async function check() {
    setIsLoading({ ...defaultLoading, data: true });
    const ans = await validateUser();
    if (ans === false) {
      localStorage.setItem("link", location.pathname);
      toast.error("Please Login To Use!");
      setLoginPopUp(true);
    } else {
      setLoginPopUp(false);
    }
    setIsLoading({ ...defaultLoading, data: false });
  }

  async function getDetails() {
    setIsLoading({ ...defaultLoading, data: true });
    if (quizzId == null) {
      toast.error("Error Fetching Quiz.");
      return;
    } else {
      const response = await getQuizz(quizzId);
      if (response.data) {
        const settingId = response.data.settings;
        const response2 = await getSettings(settingId);
        if (response2.data) {
          setSettings(response2.data);
          setDetails(response.data);
        } else {
          toast.error(response2.message);
        }
      } else {
        toast.error(response.message);
      }
    }
    setIsLoading({ ...defaultLoading, data: false });
  }

  const testingRequirements = async () => {
    setIsLoading({ ...defaultLoading, requriements: true });
    setIsPass({ ...defaultPass, requriements: false });
    
    setSystemChecks(prev => ({ ...prev, browser: 'loading' }));
    const ua = navigator.userAgent;
    let isBrave = false;
    if (navigator.brave && await navigator.brave.isBrave()) isBrave = true;
    const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(ua);
    
    const browserPass = isBrave || isChrome || isEdge;
    setSystemChecks(prev => ({ ...prev, browser: browserPass ? 'pass' : 'fail' }));

    let cameraPass = true;
    if (settings.security.video) {
      setSystemChecks(prev => ({ ...prev, camera: 'loading' }));
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        cameraPass = true;
        setSystemChecks(prev => ({ ...prev, camera: 'pass' }));
      } catch (err) {
        cameraPass = false;
        setSystemChecks(prev => ({ ...prev, camera: 'fail' }));
        toast.error("Camera access denied or not found.");
      }
    }

    setIsLoading({ ...defaultLoading, requriements: false });

    if (browserPass && cameraPass) {
      setIsPass({ ...defaultPass, requriements: true });
      toast.success("System verified. You are ready to start.");
    } else {
      toast.error("Verification failed. Please check your browser and permissions.");
    }
  };

  const handleStartTest = () => {
    if (new Date(settings.access.date.end) < new Date()) {
      setIsStop(true);
      setIsPopUpOpen({ ...defaultPopUp, noaccess: true });
      return;
    }
    setIsStop(true);
    setIsPopUpOpen({ ...defaultPopUp, start: true });
  };

  const handlePasswordCheck = () => {
    if (details.password.trim() === enterPassword.trim()) {
      setIsStop(false);
      setIsPopUpOpen({ ...defaultPopUp, start: false });
      navigate(`/quizz/test/start/${details._id}`, { state: "yes" });
    } else {
      toast.error("Incorrect password.");
    }
  };

  const primaryBtn = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryBtn = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium bg-[#333333] border border-[#444444] text-[#EEEEEE] hover:bg-[#444444] transition-colors shadow-sm cursor-pointer";
  const inputStyles = "w-full bg-[#1A1A1A] border border-[#444] rounded-md p-2.5 text-[#EEEEEE] placeholder-[#888] outline-none focus:border-[#DE5833] focus:ring-1 focus:ring-[#DE5833] transition-all";

  const StatusIcon = ({ status }) => {
    if (status === 'loading') return <Loader type="very small" />;
    if (status === 'pass') return <Check className="text-green-500" size={20} />;
    if (status === 'fail') return <X className="text-[#EF4444]" size={20} />;
    return <div className="w-5 h-5 border-2 border-[#444] rounded-full border-dashed opacity-50"></div>;
  };

  return (
    <>
      <div className="flex flex-col items-center justify-start min-h-screen w-full bg-[#111111] py-10 px-4">
        
        {isLoading.data ? (
          <div className="flex items-center justify-center h-64"><Loader type="big" /></div>
        ) : (
          !loginPopUp && details && settings && (
            <div className={`flex flex-col gap-8 w-full max-w-3xl transition-opacity duration-200 ${(isPopUpOpen.start || isPopUpOpen.noaccess) ? "opacity-40 pointer-events-none" : ""}`}>
              
              <div className="flex flex-col items-center gap-3 text-center mb-2">
                <h1 className="text-3xl font-bold text-[#EEEEEE]">Assessment Lobby</h1>
                <p className="text-[#AAAAAA]">Review the details and verify your system before starting.</p>
              </div>

              <div className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 p-4 bg-[#222] border-b border-[#333]">
                  <FileText size={20} className="text-[#DE5833]" />
                  <h2 className="text-base font-semibold text-[#EEEEEE]">{details.name}</h2>
                </div>
                
                <div className="p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-[#888888] flex items-center gap-1.5"><User size={14} /> Created By</span>
                      <span className="text-[#EEEEEE] font-medium">{details.user.name}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-[#888888] flex items-center gap-1.5"><Calendar size={14} /> Available Window</span>
                      <span className="text-[#EEEEEE] font-medium">{new Date(settings.access.date.start).toLocaleDateString()} — {new Date(settings.access.date.end).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-[#888888] flex items-center gap-1.5"><Clock size={14} /> Duration</span>
                      <span className="text-[#EEEEEE] font-medium">{settings.access.duration.hrs}h {settings.access.duration.minutes}m</span>
                    </div>
                    {settings.evalution.award.status && (
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-[#888888] flex items-center gap-1.5"><Award size={14} /> Scoring</span>
                        <span className="text-[#EEEEEE] font-medium">+{settings.evalution.award.correct} Correct, -{settings.evalution.award.wrong} Incorrect</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#333333] my-1"></div>

                  <div className="flex flex-wrap gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1.5 ${settings.security.fullScreen ? "bg-[#DE5833]/10 text-[#DE5833] border-[#DE5833]/30" : "bg-[#222] text-[#888] border-[#333]"}`}>
                      <Monitor size={14} /> Fullscreen {settings.security.fullScreen ? "Required" : "Optional"}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1.5 ${settings.security.video ? "bg-[#DE5833]/10 text-[#DE5833] border-[#DE5833]/30" : "bg-[#222] text-[#888] border-[#333]"}`}>
                      <Video size={14} /> Camera {settings.security.video ? "Required" : "Optional"}
                    </span>
                  </div>

                  {settings.security.instructions.status && (
                    <div className="mt-2 bg-[#222222] border border-[#333333] rounded-md p-4 text-sm text-[#CCCCCC] whitespace-pre-wrap leading-relaxed">
                      <span className="font-semibold text-[#EEEEEE] block mb-2">Instructions:</span>
                      {settings.security.instructions.data}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 bg-[#222] border-b border-[#333]">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={20} className="text-[#DE5833]" />
                    <h2 className="text-base font-semibold text-[#EEEEEE]">System Verification</h2>
                  </div>
                  {systemChecks.browser === 'idle' && (
                    <button 
                      className="text-xs font-medium bg-[#DE5833] text-white px-3 py-1.5 rounded hover:bg-[#c94f2e] transition-colors disabled:opacity-50 flex items-center gap-2"
                      onClick={testingRequirements}
                      disabled={isLoading.requriements}
                    >
                      {isLoading.requriements ? <Loader type="very small" /> : <Play size={12} />} Run Check
                    </button>
                  )}
                </div>
                
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 bg-[#222222] rounded-md border border-[#333333]">
                    <span className="text-sm font-medium text-[#EEEEEE]">Supported Browser (Chrome, Edge, Brave)</span>
                    <StatusIcon status={systemChecks.browser} />
                  </div>
                  
                  {settings.security.video && (
                    <div className="flex items-center justify-between p-3 bg-[#222222] rounded-md border border-[#333333]">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#EEEEEE]">Camera Connection</span>
                        <span className="text-xs text-[#888888]">Allow permissions when prompted</span>
                      </div>
                      <StatusIcon status={systemChecks.camera} />
                    </div>
                  )}

                  {systemChecks.browser === 'idle' && (
                    <div className="flex items-center gap-2 text-sm text-[#AAAAAA] mt-1">
                      <Info size={16} className="text-[#DE5833]" />
                      You must run the system check before you can begin.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  className={primaryBtn}
                  onClick={() => { if (isPass.requriements) handleStartTest(); }}
                  disabled={!isPass.requriements}
                >
                  <Lock size={18} className={isPass.requriements ? "hidden" : "block"} />
                  <span>Begin Assessment</span>
                </button>
              </div>

            </div>
          )
        )}
      </div>


      {isPopUpOpen.start && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-sm text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-2xl">
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <div className="flex items-center gap-2 text-[#DE5833]">
                <Lock size={20} />
                <span className="font-semibold text-lg">Access Required</span>
              </div>
              <button className="text-[#AAAAAA] hover:text-white transition-colors" onClick={() => { setIsPopUpOpen({ ...defaultPopUp, start: false }); setIsStop(false); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2 flex flex-col gap-2">
              <label className="text-sm text-[#CCCCCC]">Enter the quiz password to proceed:</label>
              <input 
                type="password" 
                className={inputStyles} 
                placeholder="Password"
                onChange={(e) => setEnterPassword(e.target.value)} 
                value={enterPassword}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordCheck(); }}
                autoFocus
              />
            </div>
            
            <div className="flex items-center justify-end gap-3 w-full pt-2">
              <button 
                className="px-4 py-2 rounded-md font-medium bg-transparent text-[#AAAAAA] hover:text-white hover:bg-[#333] transition-colors"
                onClick={() => { setIsPopUpOpen({ ...defaultPopUp, start: false }); setIsStop(false); }}
              >
                Cancel
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-6 py-2 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm"
                onClick={handlePasswordCheck}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {isPopUpOpen.noaccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-md text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-2xl">
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <div className="flex items-center gap-2 text-[#EF4444]">
                <AlertCircle size={20} />
                <span className="font-semibold text-lg">Access Denied</span>
              </div>
              <button className="text-[#AAAAAA] hover:text-white transition-colors" onClick={() => { setIsPopUpOpen({ ...defaultPopUp, noaccess: false }); setIsStop(false); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2 text-sm text-[#CCCCCC] leading-relaxed">
              The deadline for this assessment has passed and it is no longer accepting submissions. Please contact the quiz administrator if you believe this is an error.
            </div>
            
            <div className="flex items-center justify-end w-full pt-2">
              <button 
                className="px-6 py-2 rounded-md font-medium bg-[#333] text-white hover:bg-[#444] border border-[#444] transition-colors shadow-sm"
                onClick={() => { setIsPopUpOpen({ ...defaultPopUp, noaccess: false }); setIsStop(false); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loginPopUp && <LoginPopUp />}
    </>
  );
}