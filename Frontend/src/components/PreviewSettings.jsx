import { Copy, ExternalLink, ShieldCheck, Clock, Monitor, Video, Key, Calendar, Users, Award, FileText, CheckCircle2, BarChart, Trophy, Link as LinkIcon } from "lucide-react";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";
import { WEBSITE_LINK } from "../utils/constants";

export default function PreviewSettings({ data }) {
  
  const handleCopyClick = async (value, type) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${type} copied to clipboard`);
    } catch (err) {
      toast.error(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const SettingRow = ({ icon: Icon, label, value, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 border-b border-[#333333] last:border-0 gap-2">
      <div className="flex items-center gap-2 text-[#AAAAAA] min-w-35">
        <Icon size={16} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center justify-end gap-3 w-full sm:w-auto text-right">
        {typeof value === 'string' || typeof value === 'number' ? (
          <span className="text-sm text-[#EEEEEE] font-medium">{value}</span>
        ) : (
          value
        )}
        {action && action}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-start w-full text-[#EEEEEE]">
      

      <div className="flex flex-col w-full gap-2 border-b border-[#333333] pb-3 mb-5">
        <h2 className="text-lg font-semibold text-[#EEEEEE] flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#DE5833]" />
          Configuration & Security Overview
        </h2>
      </div>

      {!data.setting ? (
        <div className="flex flex-col items-center justify-center w-full py-10 bg-[#1A1A1A] border border-[#333333] rounded-md gap-2 text-[#888888]">
          <ShieldCheck size={32} className="text-[#444]" />
          <p className="text-sm font-medium">No security settings configured.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full pb-4">
          
         
          <div className="flex flex-col w-full bg-[#1A1A1A] border border-[#333333] rounded-md p-4 sm:p-5">
            <h3 className="text-xs font-bold tracking-wider text-[#888888] uppercase mb-2">Access & Links</h3>
            
            <SettingRow 
              icon={ExternalLink} 
              label="Dashboard" 
              value={
                <Link 
                  to={`${WEBSITE_LINK}quizz/test/dashboard/${data.id}`}
                  className="text-xs font-medium bg-[#DE5833]/10 text-[#DE5833] hover:bg-[#DE5833]/20 px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1.5"
                  target="_blank"
                >
                  View Live Dashboard <ExternalLink size={12} />
                </Link>
              }
            />
            
            <SettingRow 
              icon={FileText} 
              label="Quiz Name" 
              value={data.name} 
            />
            
            <SettingRow 
              icon={LinkIcon} 
              label="Direct Link" 
              value={
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${data.link.status ? "text-green-500 bg-green-500/10 border-green-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${data.link.status ? "bg-green-500" : "bg-red-500"}`}></div>
                    {data.link.status ? "Active" : "Inactive"}
                  </div>
                  {data.link.status && (
                    <span className="text-sm text-[#EEEEEE] truncate max-w-50 sm:max-w-75">
                      {data.link.address}
                    </span>
                  )}
                </div>
              }
              action={
                data.link.status && (
                  <button onClick={() => handleCopyClick(data.link.address, "Link")} className="text-[#888] hover:text-[#DE5833] transition-colors" title="Copy Link">
                    <Copy size={16} />
                  </button>
                )
              }
            />

            <SettingRow 
              icon={Key} 
              label="Password" 
              value={
                data.password ? (
                  <span className="font-mono text-sm bg-[#222] border border-[#444] px-2 py-0.5 rounded text-[#EEEEEE]">
                    {data.password}
                  </span>
                ) : (
                  <span className="text-[#888] text-sm">None</span>
                )
              }
              action={
                data.password && (
                  <button onClick={() => handleCopyClick(data.password, "Password")} className="text-[#888] hover:text-[#DE5833] transition-colors" title="Copy Password">
                    <Copy size={16} />
                  </button>
                )
              }
            />

            <SettingRow 
              icon={Users} 
              label="Availability" 
              value={data.setting.access.anyOne ? "Public (Anyone with link)" : "Private (Invite Only)"} 
            />

            <SettingRow 
              icon={Calendar} 
              label="Active Window" 
              value={
                <span className="text-sm">
                  {new Date(data.setting.access.date.start).toLocaleDateString()} <span className="text-[#888] mx-1">→</span> {new Date(data.setting.access.date.end).toLocaleDateString()}
                </span>
              } 
            />
            
            <SettingRow 
              icon={Clock} 
              label="Time Limit" 
              value={`${data.setting.access.duration.hrs}h ${data.setting.access.duration.minutes}m`} 
            />
          </div>

   
          <div className="flex flex-col w-full bg-[#1A1A1A] border border-[#333333] rounded-md p-4 sm:p-5">
            <h3 className="text-xs font-bold tracking-wider text-[#888888] uppercase mb-2">Proctoring Rules</h3>
            
            <SettingRow 
              icon={Monitor} 
              label="Full Screen Mode" 
              value={data.setting.security.fullScreen ? "Enforced" : "Disabled"} 
            />
            
            <SettingRow 
              icon={CheckCircle2} 
              label="Tab Switching" 
              value={
                data.setting.security.tabSwitching.status 
                  ? `Enabled (Max ${data.setting.security.tabSwitching.count} warnings)` 
                  : "Not Monitored"
              } 
            />
            
            <SettingRow 
              icon={Video} 
              label="Video Monitoring" 
              value={data.setting.security.video ? "Camera Required" : "Disabled"} 
            />
            
            <SettingRow 
              icon={FileText} 
              label="Instructions" 
              value={
                data.setting.security.instructions.status 
                  ? <span className="text-sm text-[#EEEEEE] truncate max-w-50 sm:max-w-xs">{data.setting.security.instructions.data}</span> 
                  : "None Provided"
              } 
            />
          </div>

   
          <div className="flex flex-col w-full bg-[#1A1A1A] border border-[#333333] rounded-md p-4 sm:p-5">
            <h3 className="text-xs font-bold tracking-wider text-[#888888] uppercase mb-2">Grading System</h3>
            
            <SettingRow 
              icon={Award} 
              label="Scoring Rule" 
              value={
                data.setting.evalution.count 
                  ? "Tally Only (Correct/Wrong)" 
                  : data.setting.evalution.award.status 
                    ? <span className="flex items-center gap-2">
                        <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-xs">+{data.setting.evalution.award.correct}</span>
                        <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs">-{data.setting.evalution.award.wrong}</span>
                      </span>
                    : "Standard Grading"
              } 
            />
            
            <SettingRow 
              icon={BarChart} 
              label="Post-Test Results" 
              value={data.setting.evalution.results ? "Visible to Student" : "Hidden from Student"} 
            />
            
            <SettingRow 
              icon={Trophy} 
              label="Leaderboard" 
              value={data.setting.evalution.leaderboard ? "Enabled" : "Disabled"} 
            />
          </div>

        </div>
      )}
    </div>
  );
}