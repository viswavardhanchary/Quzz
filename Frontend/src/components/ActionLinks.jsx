import { Link, useNavigate } from "react-router-dom";
import { CircleUserRound, LogOut, Upload, UserPlus, LogIn } from 'lucide-react';

export default function ActionLinks({ handleHamClick, id, setId }) {
  const navigate = useNavigate();
  
  const logoutUser = () => {
    localStorage.clear();
    setId(null);
    navigate("/");
  };


  const primaryStyle = "flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto rounded-md font-medium bg-[#DE5833] text-white hover:bg-[#c94f2e] transition-colors shadow-sm";
  const secondaryStyle = "flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto rounded-md font-medium bg-[#333333] text-[#EEEEEE] hover:bg-[#444444] border border-[#444444] transition-colors shadow-sm";
  const destructiveStyle = "flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto rounded-md font-medium text-[#AAAAAA] hover:text-[#EF4444] hover:bg-[#2A2A2A] transition-colors";

  return (
    <>
      <Link to="/create" onClick={handleHamClick} className={primaryStyle}>
        <Upload size={18} />
        <span>Upload Files</span>
      </Link>

      {id === null ? (
        <>
          <Link to="/register" onClick={handleHamClick} className={secondaryStyle}>
            <UserPlus size={18} />
            <span>Create Account</span>
          </Link>
          <Link to="/login" onClick={handleHamClick} className={secondaryStyle}>
            <LogIn size={18} />
            <span>Login</span>
          </Link>
        </>
      ) : (
        <>
          <Link to="/profile" onClick={handleHamClick} className={secondaryStyle}>
            <CircleUserRound size={18} />
            <span>Profile</span>
          </Link>
          
          <button 
            onClick={() => {
              handleHamClick();
              logoutUser();
            }} 
            className={destructiveStyle}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </>
      )}
    </>
  );
}