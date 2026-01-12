import {Link} from 'react-router-dom'
export default function Home() {
  return (
    <>
    <div className="flex flex-col items-start gap-2">
      {/* Banner */}
      <div className="flex flex-col-reverse justify-center lg:flex-row items-center lg:justify-betwen px-2 py-2 gap-10 w-full border-[#25225C] border-b">
        <div className="flex-1"></div>
        <div className="text-white flex-6 flex items-start justify-center flex-col gap-5 px-6">
          <h1 className="text-[#f5aa64] text-lg md:text-3xl">Create, share, and manage quizzes 
          with Excel or manual input.</h1>
          <h3 className="text-[#C7D2FE]">Enable link-based assessments, real-time result dashboards, and protected video-based quizzes with automated Excel reports.</h3>
          <div className="flex items-center gap-3 flex-wrap">
          <button className="p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-lg cursor-pointer grow">Take Quizze</button>
          <Link to="/create" className=" p-1 border borde-gray-200 rounded-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-lg cursor-pointer grow">Create Quizze</Link>
        </div>
        </div>
        
        <div>
          <img src="../images/Banner3.png" />
        </div>
      </div>
      {/* List of Quizz */}
      <div className="px-2 py-2">
        <h1 className="text-2xl font-bold text-[#ffffff]">List of Quizzes Taken</h1>
      </div>
    </div>
      

    </>
  )
}