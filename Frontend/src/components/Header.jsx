import { Link } from 'react-router-dom';
import { Menu, X, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import ActionLinks from './ActionLinks';

export default function Header({ isStop, setIsStop }) {
  const [isHamClicked, setIsHamClicked] = useState(false);
  const [id, setId] = useState(localStorage.getItem("id") || null);

  const handleHamClick = () => {
    setIsHamClicked(!isHamClicked);
  };

  return (

    <header className="fixed top-0 left-0 w-full h-16 bg-[#111111] border-b border-[#333333] z-50 px-4 sm:px-6 flex items-center justify-between transition-colors">
      
    
      <Link 
        to="/" 
        className="flex items-center gap-2 text-[#DE5833] hover:text-[#c94f2e] transition-colors z-50"
      >
        <CheckSquare size={24} className="stroke-[2.5]" />
        <span className="text-2xl font-bold tracking-tight">Quzz</span>
      </Link>


      <div className="hidden sm:flex items-center gap-6">
        <ActionLinks handleHamClick={handleHamClick} id={id} setId={setId} />
      </div>

    
      <div className="sm:hidden flex items-center z-50">
        <button 
          onClick={handleHamClick} 
          className="p-2 text-[#EEEEEE] hover:text-white hover:bg-[#222222] rounded-md transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          {isHamClicked ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>


      {isHamClicked && (
        <div className="absolute top-16 left-0 w-full bg-[#1A1A1A] border-b border-[#333333] shadow-xl sm:hidden flex flex-col p-4 gap-4 z-40">
          <ActionLinks handleHamClick={handleHamClick} id={id} setId={setId} />
        </div>
      )}
      
    </header>
  );
}