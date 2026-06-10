import { Eye, EyeOff, ArrowLeftToLine, TriangleAlert, CircleCheck, Check, X as XIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { addUser } from '../api/userApi';

export default function Register() {
  const navigate = useNavigate();
  const [eyeStatus, setEyeStatus] = useState(false);
  const [cEyeStatus, setCEyeStatus] = useState(false);
  
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  
  const [verificationDetails, setVerificationDetails] = useState({
    name: undefined,
    email: undefined,
    password: undefined,
    cpassword: undefined,
    passwordDetails: {
      letters: undefined,
      symbols: undefined,
      length: undefined
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleEditData = (type, e) => {
    setUserDetails((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const handleSubmitData = async () => {
    setIsLoading(true);
    const verification = verifyData();

    if (verification.status) {
      const response = await addUser(userDetails);
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
      verifyName(userDetails.name);
      verifyEmail(userDetails.email);
      verifyPassword(userDetails.password);
      verifyCPassword(userDetails.cpassword);
      setIsLoading(false);
    }
  };

  const verifyData = () => {
    return {
      status: verificationDetails.name && verificationDetails.email && verificationDetails.password && verificationDetails.cpassword
    };
  };

  const verifyName = (name) => {
    setVerificationDetails((prev) => ({ ...prev, name: name !== undefined && name.trim().length !== 0 }));
  };

  const verifyEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z]+\.[a-zA-Z]/;
    const emailVerify = emailRegex.test(email);
    setVerificationDetails((prev) => ({ ...prev, email: emailVerify }));
  };

  const verifyPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    const passwordVerify = passwordRegex.test(password);
    
    const passwordLetters = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    const passwordLetters2 = /[^A-Za-z\d@$!%*?&]/;
    const passwordLettersVerify = passwordLetters.test(password) && !passwordLetters2.test(password);
    
    const passwordSymbols = /[_\@\$!%*?&]/;
    const passwordSymbolsVerify = passwordSymbols.test(password);
    
    const passwordLengthVerify = password.length >= 6;
    
    setVerificationDetails((prev) => ({
      ...prev, 
      password: passwordVerify, 
      passwordDetails: {
        letters: passwordLettersVerify,
        symbols: passwordSymbolsVerify,
        length: passwordLengthVerify
      }
    }));
    
    if (userDetails.cpassword) {
      setVerificationDetails((prev) => ({ 
        ...prev, 
        cpassword: passwordVerify && password === userDetails.cpassword 
      }));
    }
  };

  const verifyCPassword = (cpassword) => {
    setVerificationDetails((prev) => ({ 
      ...prev, 
      cpassword: verificationDetails.password && userDetails.password === cpassword 
    }));
  };

  const inputStyles = "w-full bg-[#1A1A1A] border border-[#444] rounded-md p-2.5 text-[#EEEEEE] placeholder-[#888] outline-none focus:border-[#DE5833] focus:ring-1 focus:ring-[#DE5833] transition-all";
  
  const RequirementItem = ({ isValid, text }) => (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${isValid ? 'text-green-500' : 'text-[#888888]'}`}>
      {isValid ? <Check size={14} /> : <div className="w-1 h-1 rounded-full bg-[#888888] ml-1 mr-0.5"></div>}
      <span>{text}</span>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)] bg-[#111111]">
        
        <div className="flex flex-col lg:flex-row items-stretch bg-[#222222] text-[#EEEEEE] border border-[#333333] rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
          
          <div className="hidden lg:flex items-center justify-center bg-[#1A1A1A] p-8 border-r border-[#333333] w-1/2">
            <img src="./images/LoginImage.png" alt="Registration Illustration" className="object-contain max-h-80 opacity-90 drop-shadow-md" />
          </div>

          <div className="flex flex-col w-full lg:w-1/2 p-6 sm:p-10 gap-6">
            
            <div className="flex justify-between items-center w-full border-b border-[#333333] pb-4">
              <h1 className="text-2xl font-semibold">
                Create Account in <span className="text-[#DE5833] font-bold">Quzz</span>
              </h1>
            </div>

            <div className="flex flex-col gap-5 w-full">
              
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label htmlFor="name" className="text-sm font-medium text-[#AAAAAA]">Full Name</label>
                <div className="relative w-full">
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    className={inputStyles} 
                    id="name" 
                    onChange={(e) => { handleEditData("name", e); verifyName(e.target.value); }} 
                    onFocus={(e) => verifyName(e.target.value)} 
                  />
                  {verificationDetails.name === true && (
                    <CircleCheck size={18} className="absolute right-3 top-3 text-green-500" />
                  )}
                </div>
                {verificationDetails.name === false && (
                  <p className="flex items-center text-[#EF4444] text-xs font-medium gap-1 mt-1">
                    <TriangleAlert size={14} /> <span>Name is required</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start gap-1.5 w-full">
                <label htmlFor="email" className="text-sm font-medium text-[#AAAAAA]">Email Address</label>
                <div className="relative w-full">
                  <input 
                    type="email" 
                    placeholder="Enter a valid email" 
                    className={inputStyles} 
                    id="email" 
                    onChange={(e) => { handleEditData("email", e); verifyEmail(e.target.value); }} 
                    onFocus={(e) => verifyEmail(e.target.value)} 
                  />
                  {verificationDetails.email === true && (
                    <CircleCheck size={18} className="absolute right-3 top-3 text-green-500" />
                  )}
                </div>
                {verificationDetails.email === false && (
                  <p className="flex items-center text-[#EF4444] text-xs font-medium gap-1 mt-1">
                    <TriangleAlert size={14} /> <span>Please enter a valid email ID</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start gap-1.5 w-full">
                <label htmlFor="password" className="text-sm font-medium text-[#AAAAAA]">Password</label>
                <div className="relative w-full">
                  <input 
                    type={eyeStatus ? "text" : "password"} 
                    placeholder="Create a strong password" 
                    className={`${inputStyles} pr-10`} 
                    id="password" 
                    onChange={(e) => { handleEditData("password", e); verifyPassword(e.target.value); }} 
                    onFocus={(e) => verifyPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-2.5 text-[#888888] hover:text-[#EEEEEE] transition-colors"
                    onClick={() => setEyeStatus(!eyeStatus)}
                  >
                    {eyeStatus ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {userDetails.password.length > 0 && verificationDetails.password !== true && (
                  <div className="flex flex-col gap-1 mt-1.5 p-2.5 bg-[#1A1A1A] border border-[#333] rounded-md w-full">
                    <RequirementItem 
                      isValid={verificationDetails.passwordDetails?.letters} 
                      text="Uppercase, lowercase & numbers" 
                    />
                    <RequirementItem 
                      isValid={verificationDetails.passwordDetails?.symbols} 
                      text="At least one symbol (@$!%*?&)" 
                    />
                    <RequirementItem 
                      isValid={verificationDetails.passwordDetails?.length} 
                      text="Minimum 6 characters long" 
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start gap-1.5 w-full">
                <label htmlFor="cpassword" className="text-sm font-medium text-[#AAAAAA]">Confirm Password</label>
                <div className="relative w-full">
                  <input 
                    type={cEyeStatus ? "text" : "password"} 
                    placeholder="Repeat your password" 
                    className={`${inputStyles} pr-10`} 
                    id="cpassword" 
                    onChange={(e) => { handleEditData("cpassword", e); verifyCPassword(e.target.value); }} 
                    onFocus={(e) => verifyCPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-2.5 text-[#888888] hover:text-[#EEEEEE] transition-colors"
                    onClick={() => setCEyeStatus(!cEyeStatus)}
                  >
                    {cEyeStatus ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {verificationDetails.cpassword === false && userDetails.cpassword.length > 0 && (
                  <p className="flex items-center text-[#EF4444] text-xs font-medium gap-1 mt-1">
                    <TriangleAlert size={14} /> <span>Passwords do not match</span>
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
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between text-sm pt-4 border-t border-[#333333] mt-2 gap-4">
                <Link to="/" className="flex items-center gap-1 text-[#AAAAAA] hover:text-[#EEEEEE] transition-colors font-medium">
                  <ArrowLeftToLine size={16} />
                  <span>Back to Home</span>
                </Link>
                <div className="text-[#888888]">
                  <span>Already have an account? </span>
                  <Link to="/login" className="text-[#DE5833] hover:underline font-semibold ml-1">
                    Login Now
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