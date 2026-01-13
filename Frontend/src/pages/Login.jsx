import { Eye, EyeOff, X, ArrowLeftToLine , CircleCheck, TriangleAlert  } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import {verifyUser} from '../api/userApi';
import {toast} from 'react-toastify';
import { useNavigate } from 'react-router-dom';
export default function Login() {
  const navigate = useNavigate();
  const [eyeStatus, setEyeStatus] = useState(false);
  const [userDetails , setUserDetails] = useState({
    email: "",
    password : "",
  });
  const [verificationDetails , setVerificationDetails] = useState({
    name: undefined,
    email: undefined,
  });
  const [isLoading , setIsLoading] = useState (false);
  const handleSubmitData = async () => {
    setIsLoading(true);
    const verification = verifyData();
  
    if(verification.status) {
      const response = await verifyUser(userDetails);
      if(response.id) {
        toast.success(response.message);
        localStorage.setItem("id" , response.id);
        setIsLoading(false);
        navigate("/");
      }else {
        toast.error(response.message);
        setIsLoading(false);
      }
    }else {
      setIsLoading(false);
      return ;
    }
  }
  const handleEditData = (type , e)=> {
    setUserDetails((prev) => ({...prev , [type] : e.target.value}));
  }
  const verify = (type , e)=>{
    const typeVerify = userDetails[type].trim().length !== 0 || e.target.value.trim().length!==0;
    setVerificationDetails((prev) => ({...prev , [type] : typeVerify}));
  }

  const verifyData = ()=> {
    return {
      status: verificationDetails.email && verificationDetails.password
    }
  }
  return (
    <>
      <div className="flex items-center justify-center p-2 min-h-screen bg-[#0B1020]">
        <div className='flex flex-col lg:flex-row items-center text-[#EDE9FE] border rounded-md'>
          <div>
            <img src="./images/LoginImage.png" className='h-40 sm:h-50 md:h-80 lg:h-100 lg:w-200' />
          </div>
          <div className='flex flex-col items-start w-80 sm:w-120 gap-3 rounded-r-md p-4 '>
            <div className='flex justify-between items-center w-full border-b border-gray-400 pb-1 text-lg font-bold'>
              <p>Login To <span className='text-orange-600 text-xl font-bold'>Quzz</span></p>
            </div>
            <div className='flex flex-col gap-5 w-full'>
              <div className='flex flex-col items-start text-lg font-semibold'>
                <form className='w-full'>
                <label htmlFor="email">Email</label>
                <input type="text" placeholder="Email" className='border outline-none p-1 rounded-sm bg-white/90 w-full text-black' id="email" autoComplete='norefere' onChange={(e)=>{handleEditData("email" , e);verify("email" , e)}} onFocus={(e)=>verify("email" ,e)}/>
                {verificationDetails.email == false && <p className='flex items-center  text-red-600 text-sm font-bold gap-1 flex-row-reverse'>
                    <span>Email ID Required</span>
                    <span><TriangleAlert size={16}/></span>
                  </p>}
                {verificationDetails.email == true &&<p className='flex items-center  text-green-600 text-sm font-bold gap-1 flex-row-reverse'>
                    <span>Email ID Required</span>
                    <span><CircleCheck size={16}/></span>
                  </p>}
                </form>
              </div>
              <div className='flex flex-col items-start text-lg font-semibold'>
                <label htmlFor="password">Password</label>
                <form className='w-full'>
                <div className='flex justify-between items-center border rounded-sm bg-white/90 w-full p-1 text-black'>
                  <input type={eyeStatus ? "text" : "password"} placeholder="Password" className=' outline-none' id="password" autoComplete='norefere' onChange={(e)=>{handleEditData("password" , e);verify("password" ,e)}} onFocus={(e)=>verify("password" ,e)}/>
                  {!eyeStatus && <span className='cursor-pointer' onClick={() => setEyeStatus(!eyeStatus)}><Eye /></span>}
                  {eyeStatus && <span className='cursor-pointer' onClick={() => setEyeStatus(!eyeStatus)}><EyeOff /></span>}
                </div>
                {verificationDetails.password == false && <span className='text-red-600 flex items-center gap-1 flex-row-reverse'>
                    <span>Plz, Enter the Password</span>
                    <span><TriangleAlert size={16}/></span>
                  </span>}
                  {verificationDetails.password == true && <span className='text-green-600 flex items-center gap-1 flex-row-reverse'>
                    <span>Plz, Enter the Password</span>
                    <span><CircleCheck size={16}/></span>
                  </span>}
                </form>
              </div>
              <div className={`w-full p-2 text-center text-lg bg-orange-600 text-white rounded-sm  hover:bg-orange-500 ${isLoading ? "opacity-40  cursor-not-allowed" : "cursor-pointer"}`} onClick={handleSubmitData} disabled={isLoading}>
                {isLoading && <span className="flex items-center justify-center gap-2">
                  <span><Loader/></span>
                  <span>Verifiying...</span>
                </span>}
                {!isLoading && <span>
                  Verifiy
                </span>}
                  
              </div>
              <div className='flex items-end flex-col-reverse justify-between text-lg p-1'>
                <Link to="/"className='underline font-bold cursor-pointer text-lg flex gap-1 items-end hover:text-[#e16c6c] underline text-[#A5B4FC]'>
                  <span><ArrowLeftToLine /></span>
                  <span>Back to Home</span>
                </Link>
                <div className=''>
                  <span>Do Not have Account? </span><Link to="/register" className="hover:text-[#e16c6c] underline text-[#A5B4FC] cursor-pointer font-bold">Register Now</Link>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>



    </>
  )
}