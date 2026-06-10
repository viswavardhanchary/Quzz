import { Eye, EyeOff, ArrowLeftToLine, CircleCheck, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { verifyUser } from '../api/userApi';
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();
  const [eyeStatus, setEyeStatus] = useState(false);
  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
  });
  
  const [verificationDetails, setVerificationDetails] = useState({
    email: undefined,
    password: undefined,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitData = async () => {
    setIsLoading(true);
    const verification = verifyData();
  
    if (verification.status) {
      const response = await verifyUser(userDetails);
      if (response.id) {
        toast.success(response.message);
        localStorage.setItem("id", response.id);
        setIsLoading(false);
        navigate("/");
      } else {
        toast.error(response.message);
        setIsLoading(false);
      }
    } else {
      setVerificationDetails({
        email: userDetails.email.trim().length !== 0,
        password: userDetails.password.trim().length !== 0
      });
      setIsLoading(false);
    }
  };

  const handleEditData = (type, e) => {
    setUserDetails((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const verify = (type, e) => {
    const typeVerify = userDetails[type].trim().length !== 0 || e.target.value.trim().length !== 0;
    setVerificationDetails((prev) => ({ ...prev, [type]: typeVerify }));
  };

  const verifyData = () => {
    return {
      status: verificationDetails.email && verificationDetails.password
    };
  };


  const inputStyles = "w-full bg-[#1A1A1A] border border-[#444] rounded-md p-2.5 text-[#EEEEEE] placeholder-[#888] outline-none focus:border-[#DE5833] focus:ring-1 focus:ring-[#DE5833] transition-all";

  return (
    <>
    
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)] bg-[#111111]">
        
        <div className="flex flex-col lg:flex-row items-stretch bg-[#222222] text-[#EEEEEE] border border-[#333333] rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
          
   
          <div className="hidden lg:flex items-center justify-center bg-[#1A1A1A] p-8 border-r border-[#333333] w-1/2">
            <img src="./images/LoginImage.png" alt="Login Illustration" className="object-contain max-h-80 opacity-90 drop-shadow-md" />
          </div>

   
          <div className="flex flex-col w-full lg:w-1/2 p-6 sm:p-10 gap-6">
            
            <div className="flex justify-between items-center w-full border-b border-[#333333] pb-4">
              <h1 className="text-2xl font-semibold">
                Login To <span className="text-[#DE5833] font-bold">Quzz</span>
              </h1>
            </div>

            <div className="flex flex-col gap-5 w-full">
              
      
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label htmlFor="email" className="text-sm font-medium text-[#AAAAAA]">Email Address</label>
                <div className="relative w-full">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className={inputStyles} 
                    id="email" 
                    autoComplete="email" 
                    onChange={(e) => { handleEditData("email", e); verify("email", e); }} 
                    onFocus={(e) => verify("email", e)}
                  />
                  {verificationDetails.email === true && (
                    <CircleCheck size={18} className="absolute right-3 top-3 text-green-500" />
                  )}
                </div>
                {verificationDetails.email === false && (
                  <p className="flex items-center text-[#EF4444] text-xs font-medium gap-1 mt-1">
                    <TriangleAlert size={14} />
                    <span>Email ID is required</span>
                  </p>
                )}
              </div>

         
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label htmlFor="password" className="text-sm font-medium text-[#AAAAAA]">Password</label>
                <div className="relative w-full">
                  <input 
                    type={eyeStatus ? "text" : "password"} 
                    placeholder="Enter your password" 
                    className={`${inputStyles} pr-10`} 
                    id="password" 
                    autoComplete="current-password" 
                    onChange={(e) => { handleEditData("password", e); verify("password", e); }} 
                    onFocus={(e) => verify("password", e)}
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-2.5 text-[#888888] hover:text-[#EEEEEE] transition-colors"
                    onClick={() => setEyeStatus(!eyeStatus)}
                  >
                    {eyeStatus ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {verificationDetails.password === false && (
                  <p className="flex items-center text-[#EF4444] text-xs font-medium gap-1 mt-1">
                    <TriangleAlert size={14} />
                    <span>Password is required</span>
                  </p>
                )}
              </div>

        
              <button 
                className={`w-full py-2.5 mt-2 flex items-center justify-center text-base font-medium bg-[#DE5833] text-white rounded-md transition-colors shadow-sm ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#c94f2e] cursor-pointer"}`} 
                onClick={handleSubmitData} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader type="small" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between text-sm pt-4 border-t border-[#333333] mt-2 gap-4">
                <Link to="/" className="flex items-center gap-1 text-[#AAAAAA] hover:text-[#EEEEEE] transition-colors font-medium">
                  <ArrowLeftToLine size={16} />
                  <span>Back to Home</span>
                </Link>
                <div className="text-[#888888]">
                  <span>New here? </span>
                  <Link to="/register" className="text-[#DE5833] hover:underline font-semibold ml-1">
                    Create an account
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}