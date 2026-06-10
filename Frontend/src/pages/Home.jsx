import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { validateUser } from '../api/reCalls';
import { getUserTestList } from '../api/testApi';
import LoginPopUp from '../components/LoginPopUp';
import Loader from '../components/Loader';
import { getQuizz } from '../api/quizzApi';
import { toast } from 'react-toastify';
import { Play, Plus, Clock, Award, Calendar, FileQuestion, BookOpen } from 'lucide-react';

export default function Home() {
  const defaultLoading = {
    data: false,
  };
  const defaultPopUp = {
    login: false,
  };
  
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [isPopUpOpen, setIsPopUpOpen] = useState(defaultPopUp);
  const [details, setDetails] = useState(null);
  const [quizz, setQuizz] = useState(null);

  useEffect(() => {
    check();
    getData();
  }, []);

  async function check() {
    setIsLoading({ ...defaultLoading, data: true });
    const ans = await validateUser();
    if (ans === false) {
      toast.error("Please Login To Use!");
      setIsPopUpOpen({ ...defaultPopUp, login: true });
    } else {
      setIsPopUpOpen({ ...defaultPopUp, login: false });
    }
    setIsLoading({ ...defaultLoading, data: false });
  }

  const getData = async () => {
    if (!localStorage.getItem('id')) return;
    setIsLoading({ ...defaultLoading, data: true });
    
    const response = await getUserTestList(localStorage.getItem('id'));
    
    if (response.data) {
      response.data.reverse();
      const quizzDetails = [];
      
      for (let i = 0; i < response.data.length; i++) {
        const res2 = await getQuizz(response.data[i].quizz);
        if (res2.data) {
          quizzDetails.push(res2.data);
        } else {
          toast.error(res2.message);
          setIsLoading({ ...defaultLoading, data: false });
          return;
        }
      }
      setQuizz(quizzDetails);
      setDetails(response.data);
    } else {
      toast.error(response.message);
    }
    setIsLoading({ ...defaultLoading, data: false });
  };

 
  const primaryButton = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm cursor-pointer w-full sm:w-auto";
  const secondaryButton = "flex items-center justify-center gap-2 px-5 py-2.5 border border-[#444] rounded-md font-medium bg-[#333] text-[#eee] hover:bg-[#444] transition-colors shadow-sm cursor-pointer w-full sm:w-auto";

  return (
    <>
      <div className="flex flex-col items-start gap-8 w-full max-w-6xl mx-auto p-4 pt-6 text-[#EEEEEE]">
        
    
        <div className="flex flex-col md:flex-row items-center justify-between w-full bg-[#222] border border-[#333] rounded-lg p-8 gap-8 shadow-sm">
          <div className="flex flex-col items-start gap-4 flex-1">
            <div className="flex items-center gap-2 text-[#DE5833] mb-1">
              <BookOpen size={24} />
              <h1 className="text-2xl font-semibold text-[#EEEEEE]">
                Assessment Dashboard
              </h1>
            </div>
            <h2 className="text-lg text-[#CCCCCC] leading-snug">
              Create, share, and manage quizzes with Excel or manual input.
            </h2>
            <p className="text-sm text-[#888888] leading-relaxed max-w-xl">
              Enable link-based assessments, real-time result dashboards, and protected video-based quizzes with automated Excel reports.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full sm:w-auto">
              <Link to="/create" className={primaryButton}>
                <Play size={18} />
                <span>Take Quiz</span>
              </Link>
              <Link to="/create" className={secondaryButton}>
                <Plus size={18} />
                <span>Create Quiz</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-end items-center opacity-90">
            <img src="../images/Banner3.png" alt="Dashboard Illustration" className="max-h-48 object-contain drop-shadow-md" />
          </div>
        </div>

      
        <div className="flex flex-col w-full gap-4">
          <h2 className="text-xl font-semibold text-[#EEEEEE] border-b border-[#333] pb-2">
            Recent Assessments
          </h2>
          
 
          {!isLoading.data && details && details.length !== 0 && !isPopUpOpen.login && (
            <div className="overflow-x-auto rounded-md border border-[#333] w-full bg-[#222] shadow-sm">
              <table className="w-full text-sm text-[#CCCCCC]">
                <thead className="bg-[#1A1A1A] text-[#888888] uppercase text-xs">
                  <tr>
                    <th className="px-5 py-4 text-left font-medium border-b border-[#333]">
                      Quiz Name
                    </th>
                    <th className="px-5 py-4 text-center font-medium border-b border-[#333]">
                      <div className="flex items-center justify-center gap-1">
                        <Award size={14} /> Marks
                      </div>
                    </th>
                    <th className="px-5 py-4 text-center font-medium border-b border-[#333]">
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={14} /> Time Taken
                      </div>
                    </th>
                    <th className="px-5 py-4 text-center font-medium border-b border-[#333]">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar size={14} /> Exam Date
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {details.map((data, index) => {
                    const diffMs = new Date(data.submittedAt) - new Date(data.startedAt);
                    const minutes = (diffMs / (1000 * 60)).toFixed(2);
                    
                    return (
                      <tr
                        key={index}
                        className="border-b border-[#333] last:border-0 hover:bg-[#2A2A2A] transition-colors"
                      >
                        <td className="px-5 py-4 text-left">
                          <Link 
                            to={quizz[index].link.address} 
                            target="_blank"
                            className="text-[#DE5833] font-medium hover:underline flex items-center gap-2"
                          >
                            <span className="text-[#888] text-xs">{index + 1}.</span> 
                            {quizz[index].name}
                          </Link>
                        </td>

                        <td className="px-5 py-4 text-center font-medium text-[#EEEEEE]">
                          {data.marks}
                        </td>

                        <td className="px-5 py-4 text-center text-[#AAAAAA]">
                          {minutes} <span className="text-xs">min</span>
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

     
          {!isLoading.data && details && details.length === 0 && !isPopUpOpen.login && (
            <div className="flex flex-col items-center justify-center w-full py-16 bg-[#222] border border-[#333] rounded-md gap-3 text-[#888888]">
              <FileQuestion size={40} className="text-[#444]" />
              <p className="text-base font-medium text-[#AAAAAA]">No assessments found</p>
              <p className="text-sm">You haven't taken any quizzes yet.</p>
            </div>
          )}

     
          {isLoading.data && (
            <div className="flex w-full items-center justify-center py-20">
              <Loader type="big" />
            </div>
          )}
          
        </div>
      </div>
      

      {!isLoading.data && isPopUpOpen.login && <LoginPopUp />}
    </>
  );
}