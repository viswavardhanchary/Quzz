import { useLocation } from "react-router-dom";
import { validateUser } from "../api/reCalls";
import { getTestList } from "../api/testApi";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import LoginPopUp from "./LoginPopUp";
import Loader from "./Loader";

export default function TestDashboard() {
  const location = useLocation();
  const path = location.pathname.split("/");
  const quizzId = path[path.length - 1];
  const defaultLoading = {
    data: false,
    submit: false
  }
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [loginPopUp, setLoginPopUp] = useState(false);
  useEffect(() => {
    check();
    getDetails();
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
  async function getDetails() {
    setIsLoading({ ...defaultLoading, data: true });
    if (quizzId == null) {
      toast.error("Error in Fetching Quizz.");
      return;
    } else {
      const response = await getTestList(quizzId);
      if (response.data) {
        const updatedData = response.data.map((data) => {
          return {
            ...data , user: {name: data.user.name , id: data.user._id}
          }
        });
        updatedData.sort((a,b) => b.marks - a.marks);
        console.log(updatedData);
        setDetails(updatedData);
      } else {
        toast.error(response.message);
      }
    }
    setIsLoading({ ...defaultLoading, data: false });
  }
  return (
    <>
      {!loginPopUp && !isLoading.data && details &&
        <div className={`relative flex items-top w-full`}>
          <div className="flex flex-col gap-6 items-start p-2 border-r flex-1">
            <div className="flex flex-col gap-1 items-center">
              <h1 className="sm:text-xl text-[#f7fb00] text-center">LeaderBoard</h1>
              <div className="border w-5 sm:w-20 border-white"></div>
            </div>
            <table className="text-white w-full border">
              <thead>
                <tr>
                  <th className="border-r p-1">User Name</th>
                  <th className="border-r p-1">Marks</th>
                  <th className="border-r p-1">Time Taken</th>
                  <th className=" p-1">Exam Taken on</th>
                </tr>
              </thead>
              <tbody>
                {details.map((data,index)=> {
                  return <tr key={index} className={`border ${data.user.id === localStorage.getItem('id') ? "bg-orange-600" : ""}`}>
                    <td className="border-r">{index+1}. {data.user.name}</td>
                    <td className="border-r">{data.marks}</td>
                    <td className="border-r">{(((new Date(data.submittedAt) - new Date(data.startedAt))/(1000*60)).toFixed(2))} Minutes</td>
                    <td className="border-r">{new Date(data.startedAt).toLocaleDateString()}</td>
                  </tr>
                })}
               
              </tbody>
               
            </table>
            {
                  details.length === 0 && <div className="text-white flex w-full items-center justify-center">No Data Found</div>
                }
          </div>
        </div>
      }
      {
        isLoading.data && <div className="flex w-full items-center justify-center"><Loader type="big" /></div>
      }
      {
        loginPopUp && <LoginPopUp />
      }
    </>
  )
}