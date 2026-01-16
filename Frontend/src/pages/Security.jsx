import { BadgePlus, Eye, EyeOff, Info, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { addQuizz, getQuizz, updateOneQuizz, updateQuizz } from "../api/quizzApi";
import { useNavigate } from 'react-router-dom'
import { addSettings, getSettings, updateSettings } from "../api/settingApi";
import { WEBSITE_LINK } from "../utils/constants";
import { validateUser,formatDate } from "../api/reCalls";
export default function Security() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlData = localStorage.getItem('urlDataManual') !== 'undefined' ? JSON.parse(localStorage.getItem('urlDataManual')) : null;
  const basic = localStorage.getItem('basic') !== 'undefined' ? JSON.parse(localStorage.getItem('basic')) : null;
  const settingId = localStorage.getItem('settingId') !== 'undefined' ? JSON.parse(localStorage.getItem('settingId')) : null;

  const defaultLoading = {
    clickType: undefined,
    data: false
  }
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const defaulltDetails = {
    basic: {
      name: "",
      password: {
        value: "",
        visible: false
      },
      link: {
        status: false,
        address: ""
      }
    },
    security: {
      fullScreen: false,
      tabSwitching: {
        status: false,
        count: 0
      },
      video: false,
      instructions: {
        status: false,
        data: ""
      }
    },
    access: {
      anyOne: true,
      invite: {
        status: false,
        people: []
      },
      date: {
        start: new Date(),
        end: new Date()
      },
      duration: {
        hrs: 0,
        minutes: 0
      }
    },
    evalution: {
      count: true,
      award: {
        status: false,
        correct: 0,
        wrong: 0
      },
      results: true,
      leaderboard: true
    }
  }
  const secDetails = JSON.parse(localStorage.getItem('security'))
  const [details, setDetails] = useState(secDetails ? secDetails : defaulltDetails);
  const [loginPopUp, setLoginPopUp] = useState(false);

  useEffect(() => {
    check();
    findPath();
  }, []);


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

  const findPath = async () => {
    setIsLoading({ ...defaultLoading, data: true });
    const path = location.pathname.split("/");
    if (path.includes("edit")) {
      const id = path[path.length - 1];
      console.log(id);
      const response = await getSettings(id);
      console.log(response);

      if (response.data) {
        const response2 = await getQuizz(path[path.length - 2]);
        console.log(response2);
        if (response2.data) {
          const basic = {
            name: response2.data.name,
            password: {
              value: response2.data.password,
              visible: false,
            },
            link: response2.data.link
          }
          const cameData = { basic, security: response.data.security, access: response.data.access, evalution: response.data.evalution }
          console.log(cameData);
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
  }


  const handleBasicChange = (type1, type2, value) => {
    const data = { ...details };
    if (type2 === undefined) {
      data.basic[type1] = value;
    } else {
      data.basic[type1][type2] = value;
    }
    localStorage.setItem('security', JSON.stringify(data));
    setDetails(data);
  }

  const handleSecurityChange = (type1, type2, value) => {
    const data = { ...details };
    if (type2 === undefined) {
      data.security[type1] = value;
    } else {
      data.security[type1][type2] = value
    }
    localStorage.setItem('security', JSON.stringify(data));
    setDetails(data);
  }
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
  }
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
  }
  const handleSkipNow = async () => {
    setIsLoading({ ...defaultLoading, clickType: 'skip' });
    const response = await addQuizz(urlData);
    if (response.id !== null) {
      localStorage.removeItem('security');
      toast.success(response.message);
      setIsLoading({ ...defaultLoading, clickType: undefined });
      navigate("/create");
    } else {
      toast.error(response.message);
      setIsLoading({ ...defaultLoading, clickType: undefined });
    }
  }

  const createQuizz = async () => {
    setIsLoading({ ...defaultLoading, clickType: 'create' });
    const verification = verifyData();
    if (!verification) {
      toast.error("Plz, Fill All Fields Marked With Red Border");
      setIsLoading({ ...defaultLoading, clickType: undefined });
    } else {
      const data = { security: { ...details.security }, access: { ...details.access }, evalution: { ...details.evalution } };
      const path = location.pathname.split("/");
      let res1 = null
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
      console.log(res1);
      if (res1.id) {
        const urlData = JSON.parse(localStorage.getItem('urlDataManual'));
        let res2;
        if (quizzId) {
          res2 = await updateQuizz({ ...urlData, name: details.basic.name, password: details.basic.password.value, setting: res1.id, link: details.basic.link }, quizzId);        
        } else {
          res2 = await addQuizz({ ...urlData, name: details.basic.name, password: details.basic.password.value, setting: res1.id, link: details.basic.link });
        }
        if (res2.id) {
          if(details.basic.link.status) {
            const updatedLink = {...details.basic.link , address: `${WEBSITE_LINK}quizz/test/${res2.id}`};
            const res3 = await updateOneQuizz(res2.id , "link" , updatedLink);
            if(!res3.id) {
              toast.error(res3.message);
              return ;
            }
          }
          localStorage.removeItem('security');
          localStorage.removeItem('urlDataManual')
          localStorage.removeItem('edit')
          localStorage.removeItem('settingId')
          toast.success(res2.message);
          setIsLoading({ ...defaultLoading, clickType: undefined });
          navigate("/create");
        } else {
          toast.error(res2.message);
        }
      } else {
        toast.error(res1.message);
      }
    }
    setIsLoading({ ...defaultLoading, clickType: undefined });
  }

  const verifyData = () => {
    if (
      details.basic.name.trim() === "" || details.basic.password.value.trim() === "" ||
      details.security.instructions.status && details.security.instructions.data.trim() === "" || new Date(details.access.date.start) - new Date(details.access.date.end) > 0
      || (details.access.duration.hrs <= 0 && details.access.duration.minutes <= 0) ||
      (details.evalution.award.status && details.evalution.award.correct === 0) || details.access.duration.minutes < 0 || details.access.duration.minutes > 60 || details.access.duration.hrs < 0 || details.access.duration.hrs > 10 || (details.evalution.award.status && (details.evalution.award.correct <= details.evalution.award.wrong || details.evalution.award.wrong)) < 0
    ) {
      return false;
    } else {
      return true;
    }
  }

  return (
    <>
      <div>
        <div className="flex flex-col items-start text-white w-full px-3 sm:px-10 pt-5">
          <div className="flex items-center justify-between w-full mb-5">
            <div className="w-max flex flex-col items-center">
              <h1 className="text-md sm:text-2xl text-[#ff9100] wrap-break-word whitespace-normal">Fill the details Before Generating the Quizze</h1>
              <div className="flex items-center justify-start w-full">
                <div className="w-[50%] border"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`hidden w-max sm:flex items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.clickType !== undefined ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={handleSkipNow} disabled={isLoading.clickType !== undefined}>
                {isLoading.clickType !== 'skip' && <span>Skip For Now</span>}
                {isLoading.clickType === 'skip' && <>
                  <span>
                    <Loader type="small" />
                  </span>
                  <span>Saving....</span>
                </>}
              </div>
              <div className={`flex w-max sm:hidden items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.clickType !== undefined ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={handleSkipNow} disabled={isLoading.clickType !== undefined} title="Skip For Now">
                <Save />
              </div>
              <div className={`hidden w-max sm:flex items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.clickType !== undefined ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={createQuizz} disabled={isLoading.clickType !== undefined} >
                {isLoading.clickType !== 'create' && <span>Create</span>
                }
                {isLoading.clickType === 'create' && <>
                  <span>
                    <Loader type="small" />
                  </span>
                  <span>Creating....</span>
                  </>}
              </div>
              <div className={`flex w-max sm:hidden items-center gap-1 px-2 p-1 border borde-gray-200 rounded-sm font-semibold bg-[#3a3ded] text-white hover:bg-[#2848d9] ${isLoading.clickType !== undefined ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} onClick={createQuizz} disabled={isLoading.clickType !== undefined} title="Create Quizze">
                <BadgePlus />
              </div>
            </div>
          </div>
          {

            isLoading.data && <div className="flex w-full items-center justify-center text-white pt-20"><Loader type="big" /></div>
          }
          {!isLoading.data && <div className="flex flex-col items-start gap-2 p-2 w-full">
            <div className="w-full flex flex-col items-center">
              <h1 className="text-2xl text-[#ff9100] text-center">Basic Details</h1>
              <div className="flex items-center justify-center w-full">
                <div className="w-[10%] border"></div>
              </div>
            </div>
            <div className='flex flex-col items-start text-lg font-semibold w-full'>
              <form className='w-full'>
                <label htmlFor="name">Name:</label>
                <input type="text" placeholder="Enter the Quizz Name" className={`border-2 ${details.basic.name.trim() === "" ? "border-red-500" : "border-green-500"} outline-none p-1 rounded-sm bg-white/90 w-full text-black`} id="name" autoComplete='norefere' value={details.basic.name} onChange={(e) => handleBasicChange("name", undefined, e.target.value)} />
              </form>
            </div>
            <div className='flex flex-col items-start text-lg font-semibold w-full'>
              <label htmlFor="password">Password</label>
              <form className='w-full'>
                <div className={`flex items-center justify-between border-2 ${details.basic.password.value.trim() === "" ? "border-red-500" : "border-green-500"} outline-none p-1 rounded-sm bg-white/90 w-full text-black`}>
                  <input type={details.basic.password.visible ? "text" : "password"} placeholder="Password" className=' outline-none w-[90%]' id="password" autoComplete='norefere' value={details.basic.password.value} onChange={(e) => handleBasicChange("password", "value", e.target.value)} />
                  {!details.basic.password.visible && <span className='cursor-pointer' onClick={(e) => handleBasicChange("password", "visible", true)}><Eye /></span>}
                  {details.basic.password.visible && <span className='cursor-pointer' onClick={(e) => handleBasicChange("password", "visible", false)}><EyeOff /></span>}
                </div>
              </form>
              <div className="flex items-center gap-1 text-orange-600 text-sm font-normal">
                <span><Info size={16} /></span>
                <span>This password is needed to Enter before taking Quizze</span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={details.basic.link.status} onChange={(e) => handleBasicChange("link", "status", e.target.checked)} />
                <p>Generate the Link for Quizze</p>
              </div>
              <div className="flex items-center gap-1 text-orange-600 text-sm">
                <span><Info size={16} /></span>
                <span>Link should be Enable to Share/Take the Quizze</span>
              </div>
            </div>
          </div>}
          {!isLoading.data && <div className="flex flex-col items-start gap-2 p-2 w-full">
            <div className="w-full flex flex-col items-center">
              <h1 className="text-2xl text-[#ff9100] text-center">Security Details</h1>
              <div className="flex items-center justify-center  w-full">
                <div className="w-[10%] border"></div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={details.security.fullScreen} onChange={(e) => handleSecurityChange("fullScreen", undefined, e.target.checked)} />
                  <p>Full Screen Should be Enable</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={details.security.tabSwitching.status} onChange={(e) => handleSecurityChange("tabSwitching", 'status', e.target.checked)} />
                  <p>No Tab Switching Enable</p>
                </div>
                {details.security.tabSwitching.status &&
                  <div className="flex flex-col items-start gap-1 pl-8">
                    <label>Enter no of tab Switchings,Allowed Before Canceling Quizze</label>
                    <input type="number" value={details.security.tabSwitching.count} onChange={(e) => handleSecurityChange("tabSwitching", 'count', e.target.value)} className="border rounded-sm bg-white/90 w-20 p-1 text-black outline-none" min="0"/>
                  </div>
                }
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={details.security.video} onChange={(e) => handleSecurityChange("video", undefined, e.target.checked)} />
                  <p>Video Should be Enable</p>
                </div>
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <span><Info size={16} /></span>
                  <div className="flex flex-col items-start gap-1">
                    <span>If Video options is Enabled</span>
                    <span>5 Pictures Will be Taken Randomly</span>
                  </div>

                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 w-full">
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={details.security.instructions.status} onChange={(e) => handleSecurityChange("instructions", 'status', e.target.checked)} />
                  <p>Add Instructions</p>
                </div>
                {details.security.instructions.status &&
                  <div className="flex flex-col items-start pl-8 gap-1 w-full">
                    <div className="flex item-start gap-1 flex-col w-full">
                      <p>1) For Heading use <span className="text-orange-500 text-lg">'#'</span> before the Text</p>
                      <p>2) For Bold use <span className="text-orange-500 text-lg">*Your Text*</span></p>
                      <p>3) For Bullet Points use <span className="text-orange-500 text-lg">'-'</span> for one nesting, <span className="text-orange-500 text-lg">'--'</span> for two nesting and so on...</p>
                      <p>4) For sequence number use <span className="text-orange-500 text-lg">'+'</span> for one nesting, <span className="text-orange-500 text-lg">'++'</span> for two nesting and so on</p>
                      <p>5) For new line use <span className="text-orange-500 text-lg">'\n'</span></p>
                      <p>6) If Any of above Characters are used as normal text add <span className="text-orange-500 text-lg">'\'</span> before the symbol</p>
                    </div>
                    <textarea type="text" placeholder="E.g #Follow this Guys\n*This Quizz is Very Important*\n-Fill all the answers\n-Think Before Answer\n" autoComplete="noreferer" className={`border-2 ${details.security.instructions.status && details.security.instructions.data.trim() === "" ? "border-red-600" : "border-green-600"} outline-none bg-white text-black w-full rounded-md p-1`} rows="10" value={details.security.instructions.data} onChange={(e) => handleSecurityChange("instructions", "data", e.target.value)}></textarea>
                  </div>
                }
              </div>
            </div>
          </div>}
          {!isLoading.data && <div className="flex flex-col items-start gap-2 p-2 w-full">
            <div className="w-full flex flex-col items-center">
              <h1 className="text-2xl text-[#ff9100] text-center">Access Details</h1>
              <div className="flex items-center justify-center  w-full">
                <div className="w-[10%] border"></div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="radio" id="all" name="acess" checked={details.access.anyOne} onChange={(e) => handleAccessChange("anyOne", undefined, e.target.checked)} />
                  <p>Any One with Link And Password,Can Take the Quizze</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="radio" id="all" name="acess" checked={details.access.invite.status} onChange={(e) => handleAccessChange("invite", 'status', e.target.checked)} />
                  <p>Only the People,I Invite</p>
                </div>
                {details.access.invite.status && <div className="flex items-center gap-1 text-orange-600 text-sm">
                  details.access.invite
                </div>}
              </div>
            </div>
            {/* {console.log(new Date(details.access.date.start))}
            {console.log(new Date(details.access.date.to))}
            {console.log(new Date(details.access.date.start) - new Date(details.access.date.to))} */}
            <div className="flex items-start flex-col gap-2 w-full">
              <p className="text-lg text-orange-500">Enter the Date to Access the Quizze</p>
              <div className="flex items-center w-full gap-5 flex-wrap">
                <div className="flex items-center gap-3">
                  <p>From: </p>
                  <input type="date" className={`border-2 ${details.access.date.start === undefined || new Date(details.access.date.start) - new Date(details.access.date.end) > 0 ? "border-red-500" : "border-green-500"} outline-none p-1 rounded-sm bg-white/90 w-full text-black`} value={details.access.date.start !== undefined ? formatDate(details.access.date.start) : ""} onChange={(e) => handleAccessChange("date", 'start', e.target.value)} min={formatDate(new Date())}
                  
                  />
                </div>
                <div className="flex items-center gap-3">
                  <p>To: </p>
                  <input type="date" className={`border-2 ${details.access.date.end === undefined || new Date(details.access.date.start) - new Date(details.access.date.end) > 0 ? "border-red-500" : "border-green-500"} outline-none p-1 rounded-sm bg-white/90 w-full text-black`} value={details.access.date.end !== undefined ? formatDate(details.access.date.end) : ""}onChange={(e) => handleAccessChange("date", 'end', e.target.value)} min={formatDate(details.access.date.start === undefined ? new Date() : details.access.date.start)}/>
                </div>
              </div>
            </div>
            <div className="flex items-start flex-col gap-2 w-full flex-wrap">
              <p className="text-lg text-orange-500">Enter the Duration of the Quizze</p>
              <div className="flex items-center w-full gap-5">
                <div className="flex items-center gap-3">
                  <p>Hrs: </p>
                  <input type="number" className={`border-2 ${(details.access.duration.hrs <= 0 && details.access.duration.minutes <= 0)|| details.access.duration.hrs < 0 || details.access.duration.hrs > 10 ? "border-red-500" : "border-green-500"} outline-none p-1 rounded-sm bg-white/90 w-full text-black`} value={details.access.duration.hrs} onChange={(e) => handleAccessChange("duration", 'hrs', e.target.value)} min="0" max="10"/>
                </div>
                <div className="flex items-center gap-3">
                  <p>Minutes: </p>
                  <input type="number" className={`border-2 ${(details.access.duration.hrs <= 0 && details.access.duration.minutes <= 0)|| details.access.duration.minutes < 0 || details.access.duration.minutes > 60 ? "border-red-500" : "border-green-500"} outline-none p-1 rounded-sm bg-white/90 w-full text-black`} value={details.access.duration.minutes} onChange={(e) => handleAccessChange("duration", 'minutes', e.target.value)} min="0" max="59"/>
                </div>
              </div>
            </div>
          </div>}
          {!isLoading.data && <div className="flex flex-col items-start gap-2 p-2 w-full">
            <div className="w-full flex flex-col items-center">
              <h1 className="text-2xl text-[#ff9100] text-center">Evalution Details</h1>
              <div className="flex items-center justify-center  w-full">
                <div className="w-[10%] border"></div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="radio" id="evl" name="evalution" checked={details.evalution.count} onChange={(e) => handleEvalutionChange("count", undefined, e.target.checked)} />
                  <p>Only Count no of Answers Correct/Wrong</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="radio" id="evl" name="evalution" checked={details.evalution.award.status} onChange={(e) => handleEvalutionChange("award", 'status', e.target.checked)} />
                  <p>Award the Marks</p>
                </div>
                {details.evalution.award.status && <div className="flex flex-col items-start gap-2 pl-8">
                  <div className="flex items-center gap-2 w-full">
                    <span>Correct Answer Marks: </span>
                    <input type="number" className={`border-2 ${details.evalution.award.correct <= 0 ? "border-red-500" : "border-green-500"} outline-none p-1 rounded-sm bg-white/90 w-full text-black`}
                      value={details.evalution.award.correct} onChange={(e) => handleEvalutionChange("award", 'correct', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span>Wrong Answer Marks: </span>
                    <input type="number" className={`border-2 ${details.evalution.award.wrong < 0 || details.evalution.award.correct <= details.evalution.award.wrong? "border-red-500" : "border-green-500"} outline-none p-1 rounded-sm bg-white/90 w-full text-black`}
                      value={details.evalution.award.wrong} onChange={(e) => handleEvalutionChange("award", 'wrong', e.target.value)} min="0"
                    />
                  </div>
                </div>}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={details.evalution.results} onChange={(e) => handleEvalutionChange("results", undefined, e.target.checked)} />
                  <p>Result Should be Displayed To user</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={details.evalution.leaderboard} onChange={(e) => handleEvalutionChange("leaderboard", undefined, e.target.checked)} />
                  <p>LeaderBoard Should be Displayed To user</p>
                </div>
              </div>
            </div>
          </div>}
        </div>
      </div>
    </>
  )
}