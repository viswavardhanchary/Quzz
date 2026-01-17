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
            ...data, user: { name: data.user.name, id: data.user._id }
          }
        });
        updatedData.sort((a, b) => b.marks - a.marks);
        // console.log(updatedData);
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
            <div className="overflow-x-auto rounded-lg border border-white/10 w-full">
              <table className="w-full text-sm text-gray-200 bg-[#0B1020]">
                <thead className="bg-white/5 text-gray-300 uppercase text-xs">
                  <tr>
                    <th className="px-1 sm:px-4 py-3 text-left border-r border-white/10">
                      User Name
                    </th>
                    <th className="px-1 sm:px-4 py-3 text-center border-r border-white/10">
                      Marks
                    </th>
                    <th className="px-1 sm:px-4 py-3 text-center border-r border-white/10">
                      Time Taken
                    </th>
                    <th className="px-1 sm:px-4 py-3 text-center">
                      Exam Taken On
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {details.map((data, index) => {
                    const isMe = data.user.id === localStorage.getItem("id");
                   
                    const diffMs =
                      new Date(data.submittedAt) - new Date(data.startedAt);
                    const minutes = ((diffMs / (1000*60))).toFixed(2);
                    return (
                      <tr
                        key={index}
                        className={`
                          border-t border-white/10
                          hover:bg-white/5 transition
                          ${isMe ? "bg-orange-500/20 text-orange-300 font-semibold" : ""}
                        `}
                      >
                        <td className="px-4 py-3 border-r border-white/10">
                          {index + 1}. {data.user.name}
                        </td>

                        <td className="px-4 py-3 text-center border-r border-white/10">
                          {data.marks}
                        </td>

                        <td className="px-4 py-3 text-center border-r border-white/10">
                          {minutes} min
                        </td>

                        <td className="px-4 py-3 text-center">
                          {new Date(data.startedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

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