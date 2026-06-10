import { Link } from "react-router-dom";
import { CheckSquare, ExternalLink, Shield, Mail, FileText, Play } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-[#AAAAAA] border-t border-[#333333] mt-auto w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          

          <div className="flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#DE5833] hover:text-[#c94f2e] transition-colors">
              <CheckSquare size={24} className="stroke-[2.5]" />
              <span className="text-2xl font-bold tracking-tight">Quzz</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#888888] max-w-xs">
              Secure online quizzes with real-time monitoring, fair evaluation, and smart analytics.
            </p>
          </div>

   
          <div className="flex flex-col gap-4">
            <h3 className="text-[#EEEEEE] font-semibold text-sm uppercase tracking-wider">Product</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link to="/create" className="flex items-center gap-2 hover:text-[#DE5833] transition-colors">
                  <FileText size={16} /> Create Quiz
                </Link>
              </li>
              <li>
                <Link to="/create" className="flex items-center gap-2 hover:text-[#DE5833] transition-colors">
                  <Play size={16} /> Take Quiz
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[#EEEEEE] font-semibold text-sm uppercase tracking-wider">Security</h3>
            <ul className="flex flex-col gap-3 text-sm text-[#888888]">
              <li className="flex items-center gap-2"><Shield size={16} className="text-[#555555]" /> Fullscreen Monitoring</li>
              <li className="flex items-center gap-2"><Shield size={16} className="text-[#555555]" /> Tab Switch Detection</li>
              <li className="flex items-center gap-2"><Shield size={16} className="text-[#555555]" /> Activity Logs</li>
              <li className="flex items-center gap-2"><Shield size={16} className="text-[#555555]" /> Secure Submissions</li>
            </ul>
          </div>


          <div className="flex flex-col gap-4">
            <h3 className="text-[#EEEEEE] font-semibold text-sm uppercase tracking-wider">Support</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a 
                  href="https://viswa-vardhan.onrender.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#DE5833] transition-colors"
                >
                  <ExternalLink size={16} /> About the Creator
                </a>
              </li>
              <li>
                <Link to="/" className="flex items-center gap-2 hover:text-[#DE5833] transition-colors cursor-pointer">
                  <Mail size={16} /> Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>


        <div className="border-t border-[#333333] mt-10 mb-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-[#666666]">
          <p>© {currentYear} Quzz by Enjeti Viswa Vardhan Chary. All rights reserved.</p>
          <p className="font-medium text-[#888888]">
            Built for fair & secure assessments
          </p>
        </div>
        
      </div>
    </footer>
  );
}