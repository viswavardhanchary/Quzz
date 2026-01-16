import { Link } from "react-router-dom";

// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-[#0B1020] text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Quzz
            </h2>
            <p className="text-md leading-relaxed">
              Secure online quizzes with real-time monitoring,
              fair evaluation, and smart analytics.
            </p>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3 text-2xl">Product</h3>
            <ul className="space-y-2 text-md">
              <Link to="/create" className="hover:text-white cursor-pointer">Create Quiz</Link>
              <br/><Link to="/create" className="hover:text-white cursor-pointer">Take Quiz</Link>
            </ul>
          </div>


          <div>
            <h3 className="text-white font-medium mb-3 text-2xl">Security</h3>
            <ul className="space-y-2 text-md">
              <li>Fullscreen Monitoring</li>
              <li>Tab Switch Detection</li>
              <li>Activity Logs</li>
              <li>Secure Submissions</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3 text-2xl">Support</h3>
            <ul className="space-y-2 text-md">
              <a href="https://viswa-vardhan.onrender.com" target="_blank" className="hover:text-white cursor-pointer">About Me (Creator Enjeti Viswa Vardhan Chary)</a>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-md">

          <p>
            © {new Date().getFullYear()} Quzz. All rights reserved.
          </p>

          <p className="text-gray-500">
            Built for fair & secure assessments
          </p>

        </div>
      </div>
    </footer>
  );
}
