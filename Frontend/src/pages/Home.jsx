import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { validateUser } from '../api/reCalls';
import { getUserTestList } from '../api/testApi';
import LoginPopUp from '../components/LoginPopUp';
import Loader from '../components/Loader';
import { getQuizz } from '../api/quizzApi';
import {toast} from 'react-toastify'
export default function Home() {
  const defaultLoading = {
    data: false,
  }
  const defaultPopUp = {
    login: false,
  }
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
      toast.error("Plz Login To Use!")
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
      // console.log(response.data);
      const quizzDetails = []
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
      // console.log(quizzDetails);
      // console.log(response.data);
      setQuizz(quizzDetails);
      setDetails(response.data);
    } else {
      toast.error(response.message);
    }
    setIsLoading({ ...defaultLoading, data: false });
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2 w-full">
        {/* Banner */}
        <div className="flex flex-col-reverse justify-center lg:flex-row items-center lg:justify-between px-2 py-2 gap-10 w-full border-[#25225C] border-b">
          <div className="flex-1"></div>
          <div className="text-white flex-6 flex items-start justify-center flex-col gap-5 px-6">
            <h1 className="text-[#f5aa64] text-lg md:text-3xl">Create, share, and manage quizzes
              with Excel or manual input.</h1>
            <h3 className="text-[#C7D2FE]">Enable link-based assessments, real-time result dashboards, and protected video-based quizzes with automated Excel reports.</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/create" className="p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-lg cursor-pointer grow">Take Quizze</Link>
              <Link to="/create" className=" p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-lg cursor-pointer grow">Create Quizze</Link>
            </div>
          </div>

          <div>
            <img src="../images/Banner3.png" />
          </div>
        </div>
        {/* List of Quizz */}
        <div className="flex items-start gap-3 flex-col px-2 py-2 w-full">
          <h1 className="text-2xl font-bold text-[#ffffff]">List of Quizzes Taken</h1>
          {!isLoading.data && details && details.length !== 0 && !isPopUpOpen.login && <div className='w-full'>
            <div className="overflow-x-auto rounded-lg border border-white/10 w-full">
              <table className="w-full text-sm text-gray-200 bg-[#0B1020]">
                <thead className="bg-white/5 text-gray-300 uppercase text-xs w-full">
                  <tr>
                    <th className="px-1 sm:px-4 py-3 text-left border-r border-white/10">
                      Quizz Name
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

                <tbody className='w-full'>
                  {details.map((data, index) => {
                    const diffMs =
                      new Date(data.submittedAt) - new Date(data.startedAt);

                    const minutes = ((diffMs / (1000*60))).toFixed(2);
                    return (

                      <tr
                        key={index}
                        className={`
                          border-t border-white/10
                          hover:bg-white/5 transition w-full
                        `}
                      >
                        <td className='px-4 py-3 border-r border-white/10 underline text-orange-600/90 font-bold text-lg'><Link to={quizz[index].link.address} target="_blank">
                          {index + 1}. {quizz[index].name}
                        </Link></td>

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
          </div>}
          {!isLoading.data && details && details.length === 0 && !isPopUpOpen.login && <div className="text-white flex w-full items-center justify-center">No Data Found</div>}
          {isLoading.data && <div className="flex w-full items-center justify-center text-white pt-20"><Loader type="big" /></div>}
          {!isLoading.data && isPopUpOpen.login && <LoginPopUp />}
        </div>
      </div>


    </>
  )
}