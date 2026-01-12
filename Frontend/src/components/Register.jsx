import { Eye, EyeOff, X, ArrowLeftToLine, TriangleAlert, CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader';
import { toast } from 'react-toastify';
import { addUser } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
export default function Register() {
  const [eyeStatus, setEyeStatus] = useState(false);
  const navigate = useNavigate();
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
    cpassword: undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleEditData = (type, e) => {

    setUserDetails((prev) => ({ ...prev, [type]: e.target.value }));
  }
  const handleSubmitData = async () => {
    setIsLoading(true);
    const verification = verifyData(userDetails);

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
      setIsLoading(false);
      return;
    }
  }

  const verifyData = (userData) => {
    return {
      status: verificationDetails.name && verificationDetails.email && verificationDetails.password && verificationDetails.cpassword
    }
  }
  const verifyName = (name) => {
    setVerificationDetails((prev) => ({ ...prev, name: name == undefined || name.trim().length != 0 }));
  }

  const verifyEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9\._]+@[a-zA-Z]+\.[a-zA-Z]/;
    const emailVerify = emailRegex.test(email);
    setVerificationDetails((prev) => ({ ...prev, email: emailVerify }));
  }

  const verifyPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    const passwordVerify = passwordRegex.test(password);
    const passwordLetters = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;
    const passwordLetters2 = /[^A-Za-z\d@$!%*?&]/
    const passwordLettersVerify = passwordLetters.test(password) && !passwordLetters2.test(password);
    const passwordSymbols = /[_\@\$]/;
    const passwordSymbolsVerify = passwordSymbols.test(password);
    const passwordLengthVerify = password.length >= 6;
    setVerificationDetails((prev) => ({
      ...prev, password: passwordVerify, passwordDetails: {
        letters: passwordLettersVerify,
        symbols: passwordSymbolsVerify,
        length: passwordLengthVerify
      }
    }));
  }

  const verifyCPassword = (cpassword) => {
    setVerificationDetails((prev) => ({ ...prev, cpassword: verificationDetails.password && userDetails.password === cpassword }));
  }
  return (
    <>
      <div className="flex items-center justify-center p-2 min-h-screen bg-[#0B1020]">
        <div className='flex flex-col lg:flex-row items-center text-[#EDE9FE] border rounded-md'>
          <div>
            <img src="./images/LoginImage.png" className='h-40 sm:h-50 md:h-80 lg:h-100 lg:w-200' />
          </div>
          <form className='flex flex-col items-start w-80 sm:w-120 gap-3 rounded-r-md p-4 '>
            <div className='flex justify-between items-center w-full border-b border-gray-400 pb-1 text-lg font-bold'>
              <p>Create Account In <span className='text-orange-600 text-xl font-bold'>Quzz</span></p>
            </div>
            <div className='flex flex-col gap-5 w-full'>
              <div className='flex flex-col items-start text-lg font-semibold'>
                <label htmlFor="name">Name</label>
                <input type="text" placeholder="Name" className='border outline-none text-black  p-1 rounded-sm bg-white/90 w-full' id="name" autoComplete='norefere' onChange={(e) => { handleEditData("name", e); verifyName(e.target.value) }} onFocus={(e) => verifyName(e.target.value)} />
                {verificationDetails.name == false && <p className='flex items-center  text-red-600 text-sm font-bold gap-1 flex-row-reverse'>
                  <span>Name is Required</span>
                  <span><TriangleAlert size={16} /></span>
                </p>}
                {verificationDetails.name == true && <p className='flex items-center  text-green-600 text-sm font-bold gap-1 flex-row-reverse'>
                  <span>Name is Filled</span>
                  <span><CircleCheck size={16} /></span>
                </p>}
              </div>
              <div className='flex flex-col items-start text-lg font-semibold'>
                <label htmlFor="email">Email</label>
                <input type="text" placeholder="Email" className='border outline-none text-black  p-1 rounded-sm bg-white/90 w-full' id="email" autoComplete='norefere' onChange={(e) => { handleEditData("email", e); verifyEmail(e.target.value) }} onFocus={(e) => verifyEmail(e.target.value)} />
                {verificationDetails.email == false && <p className='flex items-center  text-red-600 text-sm font-bold gap-1 flex-row-reverse'>
                  <span>Enter Valid Email ID</span>
                  <span><TriangleAlert size={16} /></span>
                </p>}
                {verificationDetails.email == true && <p className='flex items-center  text-green-600 text-sm font-bold gap-1 flex-row-reverse'>
                  <span>Email ID is Valid</span>
                  <span><CircleCheck size={16} /></span>
                </p>}
              </div>
              <div className='flex flex-col items-start text-lg font-semibold'>
                <label htmlFor="password">Password</label>
                <div className='flex justify-between items-center border rounded-sm bg-white/90 w-full p-1'>
                  <input type={eyeStatus ? "text" : "password"} placeholder="Password" className=' outline-none text-black  flex-20' id="password" autoComplete='norefere' onChange={(e) => { handleEditData("password", e); verifyPassword(e.target.value) }} onFocus={(e) => verifyPassword(e.target.value)} />
                  {!eyeStatus && <span className='cursor-pointer flex-1 text-black' onClick={() => setEyeStatus(!eyeStatus)}><Eye /></span>}
                  {eyeStatus && <span className='cursor-pointer flex-1 text-black' onClick={() => setEyeStatus(!eyeStatus)}><EyeOff /></span>}

                </div>
                {verificationDetails.password == false && <p className='flex flex-col items-start  text-sm font-bold'>
                  {verificationDetails.passwordDetails.letters == false && <span className='text-red-600 flex items-center gap-1 flex-row-reverse'>
                    <span>A password should contains Atleast one lower , upper case letters , digits , No other letters or symbols</span>
                    <span><TriangleAlert size={16} /></span>
                  </span>}
                  {verificationDetails.passwordDetails.letters == true && <span className='text-green-600 flex items-center gap-1 flex-row-reverse'>
                    <span>A password should contains Atleast one lower , upper case letters , digits , No other letters or symbols</span>
                    <span><CircleCheck size={16} /></span>
                  </span>}

                  {verificationDetails.passwordDetails.symbols == false && <span className='text-red-600 flex items-center gap-1 flex-row-reverse'>
                    <span>A password should contains atleast one of this ('@','$','!','%','*','?','&')
                    </span>
                    <span><TriangleAlert size={16} /></span>
                  </span>}
                  {verificationDetails.passwordDetails.symbols == true && <span className='text-green-600 flex items-center gap-1 flex-row-reverse'>
                    <span>A password should contains atleast one of this ('@','$','!','%','*','?','&')
                    </span>
                    <span><CircleCheck size={16} /></span>
                  </span>}

                  {verificationDetails.passwordDetails.length == false && <span className='text-red-600 flex items-center gap-1 flex-row-reverse'>
                    <span>At least length should be 6</span>
                    <span><TriangleAlert size={16} /></span>
                  </span>}
                  {verificationDetails.passwordDetails.length == true && <span className='text-green-600 flex items-center gap-1 flex-row-reverse'>
                    <span>At least length should be 6</span>
                    <span><CircleCheck size={16} /></span>
                  </span>}
                </p>}
                {verificationDetails.password == true && <p className='flex items-center  text-green-600 text-sm font-bold gap-1 flex-row-reverse'>
                  <span>Password is Valid</span>
                  <span><CircleCheck size={16} /></span>
                </p>}
              </div>
              <div className='flex flex-col items-start text-lg font-semibold'>
                <label htmlFor="cpassword">Confirm Password</label>
                <div className='flex justify-between items-center border rounded-sm bg-white/90 w-full p-1'>
                  <input type={eyeStatus ? "text" : "password"} placeholder="Confirm Password" className=' outline-none text-black  flex-20' id="cpassword" autoComplete='norefere' onChange={(e) => { handleEditData("cpassword", e); verifyCPassword(e.target.value) }} onFocus={(e) => verifyCPassword(e.target.value)} />
                  {!eyeStatus && <span className='cursor-pointer text-black' onClick={() => setEyeStatus(!eyeStatus)}><Eye /></span>}
                  {eyeStatus && <span className='cursor-pointer text-black' onClick={() => setEyeStatus(!eyeStatus)}><EyeOff /></span>}
                </div>
                {verificationDetails.cpassword == false && <p className='flex items-center  text-red-600 text-sm font-bold gap-1 flex-row-reverse'>
                  <span>Password is Not Matching</span>
                  <span><TriangleAlert size={16} /></span>
                </p>}
                {verificationDetails.cpassword == true && <p className='flex items-center  text-green-600 text-sm font-bold gap-1 flex-row-reverse'>
                  <span>Password is Matching</span>
                  <span><CircleCheck size={16} /></span>
                </p>}
              </div>
              <div className={`w-full p-2 text-center text-lg bg-orange-600 text-white rounded-sm  hover:bg-orange-500 ${isLoading ? "opacity-40  cursor-not-allowed" : "cursor-pointer"}`} onClick={handleSubmitData} disabled={isLoading}>
                {isLoading && <span className="flex items-center justify-center gap-2">
                  <span><Loader /></span>
                  <span>Creating...</span>
                </span>}
                {!isLoading && <span>
                  Create Account
                </span>}

              </div>
              <div className='flex items-end flex-col-reverse justify-between text-lg p-1'>
                <Link to="/" className='underline font-bold cursor-pointer text-lg flex gap-1 items-end hover:text-[#e16c6c] text-[#A5B4FC]'>
                  <span><ArrowLeftToLine /></span>
                  <span>Back to Home</span>
                </Link>
                <div className=''>
                  <span>Already have Account? </span><Link to="/login" className="hover:text-[#e16c6c] underline text-[#A5B4FC] cursor-pointer font-bold">Login Now</Link>
                </div>

              </div>

            </div>
          </form>
        </div>

      </div>



    </>
  )
}