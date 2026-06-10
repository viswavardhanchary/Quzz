import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useState, useEffect } from "react";

export default function PageLayout() {
  const [isStop, setIsStop] = useState(false);

  useEffect(() => {
    if (isStop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isStop]);

  return (

    <div className="flex flex-col min-h-screen w-full bg-[#111111] text-[#EEEEEE] font-sans antialiased selection:bg-[#DE5833] selection:text-white">
      
      <Header isStop={isStop} setIsStop={setIsStop} />
      
      <main className="flex-1 flex flex-col w-full mt-16 px-2">
        <Outlet context={{ isStop, setIsStop }} />
      </main>
      
      <Footer isStop={isStop} setIsStop={setIsStop} />
      
    </div>
  );
}