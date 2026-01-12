import { Link } from "react-router-dom";
import {CircleUserRound , LogOut} from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function ActionLinks({ handleHamClick, id ,setId}) {
  const navigate = useNavigate();
  const logoutUser = ()=> {
    localStorage.removeItem("id");
    setId(null);
    navigate("/");
  }
  return (
    <>
      <Link to="/uploadfile" onClick={handleHamClick} className='w-full sm:w-max p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9]'>Upload Files</Link>
      {
        id === null && <>
          <Link to="/register" onClick={handleHamClick} className='w-full sm:w-max p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer'>Create Account</Link>
          <Link to="/login" onClick={handleHamClick} className='w-full sm:w-max p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] cursor-pointer'>Login</Link>
        </>
      }
      {
        id !== null && <>
          <Link to="/profile" onClick={handleHamClick} className='w-full sm:w-max p-1 border borde-gray-200 rounded-sm font-semibold bg-[#85ed3a] text-black hover:bg-[#66d928] cursor-pointer flex items-center gap-1'><span><CircleUserRound/></span><span>Profile</span></Link>
          <button onClick={()=>{handleHamClick();logoutUser();}} className='w-full sm:w-max p-1 border borde-gray-200 rounded-sm font-semibold bg-[#f30c0c] text-white hover:bg-[#d92828] cursor-pointer flex items-center gap-1'><span><LogOut/></span><span>Logout</span></button>
        </>
      }

    </>
  )
}