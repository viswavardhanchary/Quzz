import { useLocation } from "react-router-dom";
import { validateUser } from "../api/reCalls";
import { getTestList } from "../api/testApi";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import LoginPopUp from "./LoginPopUp";
import Loader from "./Loader";
import { Trophy, Medal, Clock, Award, Calendar, User, Inbox } from "lucide-react";

export default function TestDashboard() {
  const location = useLocation();
  const path = location.pathname.split("/");
  const quizzId = path[path.length - 1];

  const defaultLoading = {
    data: false,
    submit: false
  };

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
      toast.error("Error in Fetching Quiz.");
      return;
    } else {
      const response = await getTestList(quizzId);
      if (response.data) {
        const updatedData = response.data.map((data) => {
          return {
            ...data,
            user: { name: data.user.name, id: data.user._id }
          };
        });

        updatedData.sort((a, b) => b.marks - a.marks);
        setDetails(updatedData);
      } else {
        toast.error(response.message);
      }
    }
    setIsLoading({ ...defaultLoading, data: false });
  }

  return (
    <>
      <div className="flex flex-col items-start gap-6 w-full max-w-5xl mx-auto p-4 pt-6 text-[#EEEEEE]">


        {!loginPopUp && !isLoading.data && details && (
          <div className="flex items-center gap-3 border-b border-[#333333] pb-4 w-full">
            <Trophy className="text-[#DE5833]" size={24} />
            <h1 className="text-xl font-semibold text-[#EEEEEE]">Leaderboard</h1>
            <span className="text-sm font-medium text-[#888888] bg-[#222222] border border-[#333333] px-2 py-0.5 rounded-full ml-2">
              {details.length} Participants
            </span>
          </div>
        )}


        {!loginPopUp && !isLoading.data && details && details.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-[#333333] w-full bg-[#222222] shadow-sm">
            <table className="w-full text-sm text-[#CCCCCC]">
              <thead className="bg-[#1A1A1A] text-[#888888] uppercase text-xs">
                <tr>
                  <th className="px-5 py-4 text-left font-medium border-b border-[#333333]">
                    <div className="flex items-center gap-1.5">
                      <User size={14} /> Participant
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center font-medium border-b border-[#333333]">
                    <div className="flex items-center justify-center gap-1.5">
                      <Award size={14} /> Score
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center font-medium border-b border-[#333333]">
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock size={14} /> Time Taken
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center font-medium border-b border-[#333333]">
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar size={14} /> Date
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {details.map((data, index) => {
                  const isMe = data.user.id === localStorage.getItem("id");
                  const diffMs = new Date(data.submittedAt) - new Date(data.startedAt);

                  const totalSeconds = Math.floor(diffMs / 1000);

                  const hours = Math.floor(totalSeconds / 3600);
                  const minutes = Math.floor((totalSeconds % 3600) / 60);
                  const seconds = totalSeconds % 60;

                  return (
                    <tr
                      key={index}
                      className={`border-b border-[#333333] last:border-0 hover:bg-[#2A2A2A] transition-colors ${isMe ? "bg-[#DE5833]/10" : ""
                        }`}
                    >
                      <td className="px-5 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 font-medium text-[#888888]">
                            {index === 0 && <Medal size={18} className="text-[#DE5833]" />}
                            {index === 1 && <Medal size={18} className="text-[#AAAAAA]" />}
                            {index === 2 && <Medal size={18} className="text-[#8B5A2B]" />}
                            {index > 2 && `${index + 1}.`}
                          </span>
                          <span className={`font-medium ${isMe ? "text-[#DE5833]" : "text-[#EEEEEE]"}`}>
                            {data.user.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#DE5833] border border-[#DE5833]/30 bg-[#DE5833]/10 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-[#EEEEEE]">
                        {data.marks}
                      </td>

                      <td className="px-5 py-4 text-center text-[#AAAAAA]">
                        {hours > 0 && (
                          <>
                            {hours} <span className="text-xs mr-1">hr</span>
                          </>
                        )}

                        {(minutes > 0 || hours > 0) && (
                          <>
                            {minutes} <span className="text-xs mr-1">min</span>
                          </>
                        )}

                        {seconds} <span className="text-xs">sec</span>
                      </td>

                      <td className="px-5 py-4 text-center text-[#AAAAAA]">
                        {new Date(data.startedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}


        {!loginPopUp && !isLoading.data && details && details.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full py-20 bg-[#222222] border border-[#333333] rounded-md gap-3 text-[#888888]">
            <Inbox size={40} className="text-[#444444]" />
            <p className="text-base font-medium text-[#AAAAAA]">No submissions yet</p>
            <p className="text-sm">When users complete this quiz, their results will appear here.</p>
          </div>
        )}


        {isLoading.data && (
          <div className="flex w-full items-center justify-center py-20">
            <Loader type="big" />
          </div>
        )}

      </div>

      {loginPopUp && <LoginPopUp />}
    </>
  );
}