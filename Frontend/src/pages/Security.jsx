import { BadgePlus, Eye, EyeOff, Info, Save, Settings, ShieldCheck, Users, Award, Link as LinkIcon, CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { addQuizz, getQuizz, updateOneQuizz, updateQuizz } from "../api/quizzApi";
import { addSettings, getSettings, updateSettings } from "../api/settingApi";
import { WEBSITE_LINK } from "../utils/constants";
import { validateUser, formatDate } from "../api/reCalls";

export default function Security() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const urlData = localStorage.getItem('urlDataManual') !== 'undefined' ? JSON.parse(localStorage.getItem('urlDataManual')) : null;
  const basic = localStorage.getItem('basic') !== 'undefined' ? JSON.parse(localStorage.getItem('basic')) : null;
  const settingId = localStorage.getItem('settingId') !== 'undefined' ? JSON.parse(localStorage.getItem('settingId')) : null;

  const defaultLoading = {
    clickType: undefined,
    data: false
  };
  
  const [isLoading, setIsLoading] = useState(defaultLoading);
  
  const defaultDetails = {
    basic: {
      name: "",
      password: { value: "", visible: false },
      link: { status: false, address: "" }
    },
    security: {
      fullScreen: false,
      tabSwitching: { status: false, count: 0 },
      video: false,
      instructions: { status: false, data: "" }
    },
    access: {
      anyOne: true,
      invite: { status: false, people: [] },
      date: { start: new Date(), end: new Date() },
      duration: { hrs: 0, minutes: 0 }
    },
    evalution: {
      count: true,
      award: { status: false, correct: 0, wrong: 0 },
      results: true,
      leaderboard: true
    }
  };
  
  const secDetails = JSON.parse(localStorage.getItem('security'));
  const [details, setDetails] = useState(secDetails ? secDetails : defaultDetails);
  const [loginPopUp, setLoginPopUp] = useState(false);

  useEffect(() => {
    check();
    findPath();
  }, []);

  async function check() {
    setIsLoading({ ...defaultLoading, data: true });
    const ans = await validateUser();
    if (ans === false) {
      toast.error("Please Login To Use!");
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
      const response = await getSettings(id);

      if (response.data) {
        const response2 = await getQuizz(path[path.length - 2]);
        if (response2.data) {
          const basic = {
            name: response2.data.name,
            password: {
              value: response2.data.password,
              visible: false,
            },
            link: response2.data.link
          };
          const cameData = { basic, security: response.data.security, access: response.data.access, evalution: response.data.evalution };
          setDetails(cameData);
          localStorage.setItem('security', JSON.stringify(cameData));
        } else {
          toast.error(response.message);
        }
      } else {
        toast.error(response.message);
      }
    }
    setIsLoading({ ...defaultLoading, data: false });
  };

  const handleBasicChange = (type1, type2, value) => {
    const data = { ...details };
    if (type2 === undefined) {
      data.basic[type1] = value;
    } else {
      data.basic[type1][type2] = value;
    }
    localStorage.setItem('security', JSON.stringify(data));
    setDetails(data);
  };

  const handleSecurityChange = (type1, type2, value) => {
    const data = { ...details };
    if (type2 === undefined) {
      data.security[type1] = value;
    } else {
      data.security[type1][type2] = value;
    }
    localStorage.setItem('security', JSON.stringify(data));
    setDetails(data);
  };

  const handleAccessChange = (type1, type2, value) => {
    const data = { ...details };
    if (type2 === undefined) {
      data.access[type1] = value;
      if (type1 === 'anyOne') {
        data.access.invite.status = false;
      }
    } else {
      if (type1 === 'invite') {
        data.access.anyOne = false;
      }
      data.access[type1][type2] = value;
    }
    localStorage.setItem('security', JSON.stringify(data));
    setDetails(data);
  };

  const handleEvalutionChange = (type1, type2, value) => {
    const data = { ...details };
    if (type2 !== undefined) {
      data.evalution[type1][type2] = value;
      data.evalution.count = false;
    } else {
      data.evalution[type1] = value;
      if (type1 === 'count') {
        data.evalution.award.status = false;
      }
    }
    localStorage.setItem('security', JSON.stringify(data));
    setDetails(data);
  };

  const handleSkipNow = async () => {
    setIsLoading({ ...defaultLoading, clickType: 'skip' });
    const response = await addQuizz(urlData);
    if (response.id !== null) {
      localStorage.removeItem('security');
      toast.success(response.message);
      navigate("/create");
    } else {
      toast.error(response.message);
    }
    setIsLoading({ ...defaultLoading, clickType: undefined });
  };

  const verifyData = () => {
    if (
      details.basic.name.trim() === "" || 
      details.basic.password.value.trim() === "" ||
      (details.security.instructions.status && details.security.instructions.data.trim() === "") || 
      new Date(details.access.date.start) - new Date(details.access.date.end) > 0 || 
      (details.access.duration.hrs <= 0 && details.access.duration.minutes <= 0) ||
      (details.evalution.award.status && details.evalution.award.correct === 0) || 
      details.access.duration.minutes < 0 || details.access.duration.minutes > 60 || 
      details.access.duration.hrs < 0 || details.access.duration.hrs > 10 || 
      (details.evalution.award.status && (details.evalution.award.correct <= details.evalution.award.wrong || details.evalution.award.wrong < 0))
    ) {
      return false;
    }
    return true;
  };

  const createQuizz = async () => {
    setIsLoading({ ...defaultLoading, clickType: 'create' });
    const verification = verifyData();
    
    if (!verification) {
      toast.error("Please fill all required fields correctly.");
      setIsLoading({ ...defaultLoading, clickType: undefined });
      return;
    } 
    
    const data = { security: { ...details.security }, access: { ...details.access }, evalution: { ...details.evalution } };
    const path = location.pathname.split("/");
    let res1 = null;
    let quizzId = null;
    
    if (path.includes("edit")) {
      const id = path[path.length - 1];
      quizzId = path[path.length - 2];
      res1 = await updateSettings(data, id);
    } else {
      if (path.includes("add")) {
        quizzId = path[path.length - 1];
      }
      res1 = await addSettings(data);
    }

    if (res1.id) {
      const urlData = JSON.parse(localStorage.getItem('urlDataManual'));
      let res2;
      
      const payload = { ...urlData, name: details.basic.name, password: details.basic.password.value, setting: res1.id, link: details.basic.link };
      
      if (quizzId) {
        res2 = await updateQuizz(payload, quizzId);        
      } else {
        res2 = await addQuizz(payload);
      }
      
      if (res2.id) {
        if(details.basic.link.status) {
          const updatedLink = { ...details.basic.link, address: `${WEBSITE_LINK}quizz/test/${res2.id}` };
          const res3 = await updateOneQuizz(res2.id, "link", updatedLink);
          if(!res3.id) {
            toast.error(res3.message);
            setIsLoading({ ...defaultLoading, clickType: undefined });
            return;
          }
        }
        localStorage.removeItem('security');
        localStorage.removeItem('urlDataManual');
        localStorage.removeItem('edit');
        localStorage.removeItem('settingId');
        toast.success(res2.message);
        navigate("/create");
      } else {
        toast.error(res2.message);
      }
    } else {
      toast.error(res1.message);
    }
    setIsLoading({ ...defaultLoading, clickType: undefined });
  };

  const getInputStyle = (isError) => `w-full bg-[#222222] border ${isError ? "border-[#EF4444]" : "border-[#444444]"} rounded-md p-2.5 text-[#EEEEEE] placeholder-[#888888] outline-none focus:border-[#DE5833] focus:ring-1 focus:ring-[#DE5833] transition-all`;
  const checkboxStyle = "w-4 h-4 accent-[#DE5833] cursor-pointer";
  const primaryBtn = "flex items-center gap-2 px-5 py-2.5 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryBtn = "flex items-center gap-2 px-5 py-2.5 rounded-md font-medium bg-[#333333] border border-[#444444] text-[#EEEEEE] hover:bg-[#444444] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col items-center w-full min-h-screen text-[#EEEEEE] pb-20">
      
      <div className="sticky top-16 z-40 flex flex-col sm:flex-row items-center justify-between w-full px-4 sm:px-8 py-4 bg-[#111111]/90 backdrop-blur-md border-b border-[#333333] gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#EEEEEE]">Configuration</h1>
          <div className="h-4 w-px bg-[#444] hidden sm:block"></div>
          <span className="text-sm text-[#888] hidden sm:block">Finalize quiz settings</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className={secondaryBtn} onClick={handleSkipNow} disabled={isLoading.clickType !== undefined}>
            {isLoading.clickType === 'skip' ? <Loader type="small" /> : <Save size={18} />}
            <span>{isLoading.clickType === 'skip' ? 'Saving...' : 'Save & Skip Config'}</span>
          </button>

          <button className={primaryBtn} onClick={createQuizz} disabled={isLoading.clickType !== undefined}>
            {isLoading.clickType === 'create' ? <Loader type="small" /> : <BadgePlus size={18} />}
            <span>{isLoading.clickType === 'create' ? 'Publishing...' : 'Publish Quiz'}</span>
          </button>
        </div>
      </div>

      {isLoading.data ? (
        <div className="flex w-full items-center justify-center py-20"><Loader type="big" /></div>
      ) : (
        <div className="flex flex-col items-start px-4 sm:px-8 py-8 gap-8 w-full max-w-4xl mx-auto">
          
          <div className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 p-4 bg-[#222] border-b border-[#333]">
              <Settings size={20} className="text-[#DE5833]" />
              <h2 className="text-base font-semibold text-[#EEEEEE]">Basic Details</h2>
            </div>
            
            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-[#AAAAAA]">Quiz Name</label>
                <input 
                  type="text" 
                  placeholder="Enter a title for this assessment" 
                  id="name" 
                  className={getInputStyle(details.basic.name.trim() === "")} 
                  value={details.basic.name} 
                  onChange={(e) => handleBasicChange("name", undefined, e.target.value)} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-[#AAAAAA]">Access Password</label>
                <div className="relative w-full">
                  <input 
                    type={details.basic.password.visible ? "text" : "password"} 
                    placeholder="Enter an access code" 
                    id="password" 
                    className={`${getInputStyle(details.basic.password.value.trim() === "")} pr-10`}
                    value={details.basic.password.value} 
                    onChange={(e) => handleBasicChange("password", "value", e.target.value)} 
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-2.5 text-[#888888] hover:text-[#EEEEEE] transition-colors"
                    onClick={() => handleBasicChange("password", "visible", !details.basic.password.visible)}
                  >
                    {details.basic.password.visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-[#888888] mt-0.5">
                  <Info size={14} className="text-[#DE5833]" />
                  Participants must enter this password to begin the quiz.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#222222] border border-[#333333] rounded-md hover:border-[#444444] transition-colors">
                  <input 
                    type="checkbox" 
                    className={checkboxStyle}
                    checked={details.basic.link.status} 
                    onChange={(e) => handleBasicChange("link", "status", e.target.checked)} 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#EEEEEE]">Generate Shareable Link</span>
                    <span className="text-xs text-[#888888]">Must be enabled to allow participants to take the quiz remotely.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 p-4 bg-[#222] border-b border-[#333]">
              <ShieldCheck size={20} className="text-[#DE5833]" />
              <h2 className="text-base font-semibold text-[#EEEEEE]">Proctoring & Security</h2>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className={checkboxStyle}
                  checked={details.security.fullScreen} 
                  onChange={(e) => handleSecurityChange("fullScreen", undefined, e.target.checked)} 
                />
                <span className="text-sm font-medium">Enforce Full Screen Mode</span>
              </label>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className={checkboxStyle}
                    checked={details.security.tabSwitching.status} 
                    onChange={(e) => handleSecurityChange("tabSwitching", 'status', e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Prevent Tab Switching</span>
                </label>
                
                {details.security.tabSwitching.status && (
                  <div className="flex items-center gap-3 pl-7">
                    <input 
                      type="number" 
                      value={details.security.tabSwitching.count} 
                      onChange={(e) => handleSecurityChange("tabSwitching", 'count', e.target.value)} 
                      className="w-20 bg-[#222222] border border-[#444444] rounded p-1.5 text-sm outline-none focus:border-[#DE5833]" 
                      min="0" 
                    />
                    <span className="text-sm text-[#888888]">Warnings allowed before auto-submission</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 pb-2 border-b border-[#333]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className={checkboxStyle}
                    checked={details.security.video} 
                    onChange={(e) => handleSecurityChange("video", undefined, e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Enable Camera Proctoring</span>
                </label>
                {details.security.video && (
                  <p className="flex items-center gap-1.5 text-xs text-[#888888] pl-7">
                    <Info size={14} className="text-[#DE5833]" />
                    Captures 5 random snapshots of the user during the session.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className={checkboxStyle}
                    checked={details.security.instructions.status} 
                    onChange={(e) => handleSecurityChange("instructions", 'status', e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Provide Pre-Quiz Instructions</span>
                </label>
                
                {details.security.instructions.status && (
                  <div className="flex flex-col gap-3 pl-7">
                    <div className="bg-[#222222] border border-[#333333] p-3 rounded-md text-xs text-[#AAAAAA] flex flex-col gap-1.5 font-mono">
                      <p><span className="text-[#DE5833]">#</span> Heading text</p>
                      <p><span className="text-[#DE5833]">*</span>Bold text<span className="text-[#DE5833]">*</span></p>
                      <p><span className="text-[#DE5833]">-</span> Bullet point (use -- for nested)</p>
                      <p><span className="text-[#DE5833]">+</span> Numbered list (use ++ for nested)</p>
                      <p><span className="text-[#DE5833]">\n</span> New line break</p>
                    </div>
                    <textarea 
                      placeholder="Write instructions here..." 
                      className={`${getInputStyle(details.security.instructions.status && details.security.instructions.data.trim() === "")} font-mono text-sm`} 
                      rows="6" 
                      value={details.security.instructions.data} 
                      onChange={(e) => handleSecurityChange("instructions", "data", e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 p-4 bg-[#222] border-b border-[#333]">
              <Users size={20} className="text-[#DE5833]" />
              <h2 className="text-base font-semibold text-[#EEEEEE]">Access Window & Duration</h2>
            </div>
            
            <div className="p-5 flex flex-col gap-6">
              
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="access" 
                    className={checkboxStyle}
                    checked={details.access.anyOne} 
                    onChange={(e) => handleAccessChange("anyOne", undefined, e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Public (Anyone with link and password)</span>
                </label>
                <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                  <input type="radio" name="access" className={checkboxStyle} disabled />
                  <span className="text-sm font-medium">Private (Invite only - Coming soon)</span>
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-[#333]">
                <span className="text-sm font-medium text-[#AAAAAA]">Active Window</span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs text-[#888888]">Start Date</label>
                    <input 
                      type="date" 
                      className={getInputStyle(details.access.date.start === undefined || new Date(details.access.date.start) - new Date(details.access.date.end) > 0)} 
                      value={details.access.date.start !== undefined ? formatDate(details.access.date.start) : ""} 
                      onChange={(e) => handleAccessChange("date", 'start', e.target.value)} 
                      min={formatDate(new Date())}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs text-[#888888]">End Date</label>
                    <input 
                      type="date" 
                      className={getInputStyle(details.access.date.end === undefined || new Date(details.access.date.start) - new Date(details.access.date.end) > 0)} 
                      value={details.access.date.end !== undefined ? formatDate(details.access.date.end) : ""}
                      onChange={(e) => handleAccessChange("date", 'end', e.target.value)} 
                      min={formatDate(details.access.date.start === undefined ? new Date() : details.access.date.start)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-[#333]">
                <span className="text-sm font-medium text-[#AAAAAA]">Time Limit (Duration)</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className={`w-20 ${getInputStyle((details.access.duration.hrs <= 0 && details.access.duration.minutes <= 0) || details.access.duration.hrs < 0 || details.access.duration.hrs > 10)}`} 
                      value={details.access.duration.hrs} 
                      onChange={(e) => handleAccessChange("duration", 'hrs', e.target.value)} 
                      min="0" max="10" 
                    />
                    <span className="text-sm text-[#888888]">Hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className={`w-20 ${getInputStyle((details.access.duration.hrs <= 0 && details.access.duration.minutes <= 0) || details.access.duration.minutes < 0 || details.access.duration.minutes > 60)}`} 
                      value={details.access.duration.minutes} 
                      onChange={(e) => handleAccessChange("duration", 'minutes', e.target.value)} 
                      min="0" max="59" 
                    />
                    <span className="text-sm text-[#888888]">Minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg shadow-sm overflow-hidden flex flex-col mb-10">
            <div className="flex items-center gap-2 p-4 bg-[#222] border-b border-[#333]">
              <Award size={20} className="text-[#DE5833]" />
              <h2 className="text-base font-semibold text-[#EEEEEE]">Evaluation Rules</h2>
            </div>
            
            <div className="p-5 flex flex-col gap-5">
              
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="evaluation" 
                    className={checkboxStyle}
                    checked={details.evalution.count} 
                    onChange={(e) => handleEvalutionChange("count", undefined, e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Tally Only (Simply count correct vs wrong)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="evaluation" 
                    className={checkboxStyle}
                    checked={details.evalution.award.status} 
                    onChange={(e) => handleEvalutionChange("award", 'status', e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Weighted Scoring (Assign marks)</span>
                </label>
                
                {details.evalution.award.status && (
                  <div className="flex flex-col sm:flex-row gap-4 pl-7 pt-2">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm text-[#888888]">Correct (+)</span>
                      <input 
                        type="number" 
                        className={getInputStyle(details.evalution.award.correct <= 0)}
                        value={details.evalution.award.correct} 
                        onChange={(e) => handleEvalutionChange("award", 'correct', e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm text-[#888888]">Wrong (-)</span>
                      <input 
                        type="number" 
                        className={getInputStyle(details.evalution.award.wrong < 0 || details.evalution.award.correct <= details.evalution.award.wrong)}
                        value={details.evalution.award.wrong} 
                        onChange={(e) => handleEvalutionChange("award", 'wrong', e.target.value)} 
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-[#333]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className={checkboxStyle}
                    checked={details.evalution.results} 
                    onChange={(e) => handleEvalutionChange("results", undefined, e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Allow participants to view their results post-submission</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className={checkboxStyle}
                    checked={details.evalution.leaderboard} 
                    onChange={(e) => handleEvalutionChange("leaderboard", undefined, e.target.checked)} 
                  />
                  <span className="text-sm font-medium">Display global leaderboard to participants</span>
                </label>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}