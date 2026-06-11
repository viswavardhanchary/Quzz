import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateUser } from '../api/reCalls';
import { getUserTestList } from '../api/testApi';
import LoginPopUp from '../components/LoginPopUp';
import Loader from '../components/Loader';
import { getQuizz } from '../api/quizzApi';
import { toast } from 'react-toastify';
import { Play, Plus, Clock, Award, Calendar, FileQuestion, BookOpen, Search, X } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const defaultLoading = {
    data: false,
    submit: false, // Added to handle API call loading state during ID submission
  };
  const defaultPopUp = {
    login: false,
    takeQuiz: false, // Added for the new popup
  };
  
  const [isLoading, setIsLoading] = useState(defaultLoading);
  const [isPopUpOpen, setIsPopUpOpen] = useState(defaultPopUp);
  const [details, setDetails] = useState(null);
  const [quizz, setQuizz] = useState(null);
  const [quizId, setQuizId] = useState(''); // Added to track the input

  useEffect(() => {
    check();
    getData();
  }, []);

  async function check() {
    setIsLoading({ ...defaultLoading, data: true });
    const ans = await validateUser();
    if (ans === false) {
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

  // --- New function to handle the Quiz ID submission ---
  const handleQuizSubmit = async () => {
    if (!quizId.trim()) {
      toast.error("Please enter a Quiz ID");
      return;
    }

    setIsLoading({ ...isLoading, submit: true });
    
    // Call the API
    const response = await getQuizz(quizId);
    
    setIsLoading({ ...isLoading, submit: false });

    // Based on your getQuizz logic, the payload is usually inside response.data
    // but handling response.link as a fallback just in case based on your prompt
    const targetData = response.data || response; 

    if (targetData && targetData.link && targetData.link.address) {
      setIsPopUpOpen({ ...defaultPopUp, takeQuiz: false });
      setQuizId(''); // Reset input
      navigate(targetData.link.address);
    } else {
      toast.error(response.message || "Invalid Quiz ID or Quiz not found");
    }
  };

  const primaryButton = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm cursor-pointer w-full sm:w-auto";
  const secondaryButton = "flex items-center justify-center gap-2 px-5 py-2.5 border border-[#444] rounded-md font-medium bg-[#333] text-[#eee] hover:bg-[#444] transition-colors shadow-sm cursor-pointer w-full sm:w-auto";
  const inputStyles = "w-full bg-[#1A1A1A] border border-[#444] text-[#EEEEEE] px-4 py-2 rounded-md focus:outline-none focus:border-[#DE5833] transition-colors";

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
              {/* Changed from Link to button to trigger the modal */}
              <button 
                onClick={() => setIsPopUpOpen({ ...defaultPopUp, takeQuiz: true })} 
                className={primaryButton}
              >
                <Play size={18} />
                <span>Take Quiz</span>
              </button>
              
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
                     const totalSeconds = Math.floor(diffMs / 1000);
                     const hours = Math.floor(totalSeconds / 3600);
                     const minutes = Math.floor((totalSeconds % 3600) / 60);
                     const seconds = totalSeconds % 60;
                    
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

      {/* --- New Take Quiz PopUp --- */}
      {isPopUpOpen.takeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="flex flex-col gap-4 w-full max-w-sm text-[#EEEEEE] p-6 border border-[#444] rounded-lg bg-[#222] shadow-2xl">
            <div className="flex items-center justify-between w-full border-b border-[#444] pb-3">
              <div className="flex items-center gap-2 text-[#DE5833]">
                <Search size={20} />
                <span className="font-semibold text-lg">Enter Quiz ID</span>
              </div>
              <button 
                className="text-[#AAAAAA] hover:text-white transition-colors" 
                onClick={() => { setIsPopUpOpen({ ...defaultPopUp, takeQuiz: false }); setQuizId(''); }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2 flex flex-col gap-2">
              <label className="text-sm text-[#CCCCCC]">Enter the unique quiz ID to proceed:</label>
              <input 
                type="text" 
                className={inputStyles} 
                placeholder="e.g., 64b7a..."
                onChange={(e) => setQuizId(e.target.value)} 
                value={quizId}
                onKeyDown={(e) => { if (e.key === 'Enter') handleQuizSubmit(); }}
                autoFocus
                disabled={isLoading.submit}
              />
            </div>
            
            <div className="flex items-center justify-end gap-3 w-full pt-2">
              <button 
                className="px-4 py-2 rounded-md font-medium bg-transparent text-[#AAAAAA] hover:text-white hover:bg-[#333] transition-colors"
                onClick={() => { setIsPopUpOpen({ ...defaultPopUp, takeQuiz: false }); setQuizId(''); }}
                disabled={isLoading.submit}
              >
                Cancel
              </button>
              <button 
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md font-medium text-white transition-colors shadow-sm ${isLoading.submit ? 'bg-[#a34125] cursor-not-allowed' : 'bg-[#DE5833] hover:bg-[#c94f2e]'}`}
                onClick={handleQuizSubmit}
                disabled={isLoading.submit}
              >
                {isLoading.submit ? 'Verifying...' : 'Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}