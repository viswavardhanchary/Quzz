import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react';
import ActionLinks from './ActionLinks';

export default function Header() {
  const [isHamClicked, setIsHamClicked] = useState(false);
  const handleHamClick = () => {
    setIsHamClicked(!isHamClicked);
  }
  const [id , setId] = useState(localStorage.getItem("id") || null);

  return (
    <>
      <div className='fixed flex justify-between items-top sm:items-center border-b border-gray-300 py-1 h-12 w-full px-2 top-0 z-50 bg-[#0B1020]'>
        <Link to="/" className="text-[#7C3AED] text-3xl font-bold">Quzz</Link>
        <div className='hidden sm:flex gap-5 items-center'>
          <ActionLinks handleHamClick={handleHamClick} id={id} setId={setId}/>
        </div>

        <div className='sm:hidden relative'>
          {!isHamClicked && <button onClick={handleHamClick} className='cursor-pointer rounded-full hover:bg-gray-500 p-1 text-white'><Menu /></button>}

          {
            isHamClicked &&
            <>
              <div className='flex flex-col items-end relative text-white'>
                <button onClick={handleHamClick} className='cursor-pointer rounded-full hover:bg-gray-500 p-1 text-white'><X /></button>
              </div>
              <div className='sm:hidden mt-4 absoulte flex flex-col items-end w-max p-2 gap-2 rounded-md float-end bg-gray-300 z-80'>
                <ActionLinks handleHamClick={handleHamClick} id={id} setId={setId}/>
              </div>
            </>
          }
        </div>
      </div>
    </>
  )
}

