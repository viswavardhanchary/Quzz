export default function PreviewSettings({ data }) {
  return (
    <>
      <div className="flex flex-col items-start gap-5 p-2 w-full text-white">
        <div className="flex flex-col items-center w-full gap-1">
          <h1 className="text-2xl text-[#ff9100] text-center w-full">Preview Security</h1>
          <div className="border border-white w-[10%]"></div>
        </div>
        {
          data.setting &&
          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex items-center gap-2 w-full">
              <span>Name: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{data.name}</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Password: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{data.password}</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Link: </span>
              {data.link.status && <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{data.link.address + "hello"}</div>}
              {!data.link.status && <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">To Active the Link,Click on the Pencil Icon.</div>}
              <div className={`w-3 h-3 rounded-md ${data.link.status ? "bg-green-600" : "bg-red-600"}`} title={data.link.status ? "Link is Active" : "Link No Active"}></div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Full Screen Mode: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{
                data.setting.security.fullScreen ? `Enabled` : "Not Enabled"
              }</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Tab Switching: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{
                data.setting.security.tabSwitching.status ? `Enabled, ${data.setting.security.tabSwitching.count} Allowed` : "Not Enabled"
              }</div>
            </div>
             <div className="flex items-center gap-2 w-full">
              <span>Video: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{
                data.setting.security.video ? `Enabled` : "Not Enabled"
              }</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Instructions: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{
                data.setting.security.instructions.status ? `${data.setting.security.instructions.data}` : "Not Enabled"
              }</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Access: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{
                data.setting.access.anyOne ? `Any one can Access` : "Only Invited People csn Access"
              }</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>From Date: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{
                new Date(data.setting.access.date.start).toLocaleDateString()
              }</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>To Date: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{
                new Date(data.setting.access.date.end).toLocaleDateString()
              }</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Duration: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">{
                data.setting.access.duration.hrs + " Hour " + data.setting.access.duration.minutes + " Minutes" 
              }</div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Marks: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">
              {
                data.setting.evalution.count && "Only Count Correct and Wrong Answers"
              }
              {
                data.setting.evalution.award.status && `Correct Answer: ${data.setting.evalution.award.correct} Marks, Wrong Answer: -${data.setting.evalution.award.wrong}` 
              }
              </div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>Results: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">
              {
                data.setting.evalution.results ? "Results Should be Shown" : "Result Will not be Displayed"
              }
              </div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span>LeaderBoard: </span>
              <div className="flex  items-center text-lg text-orange-500 border border-gray-500 rounded-md p-1 bg-gray-600/50 wrap-break-words whitespace-normal">
              {
                data.setting.evalution.leaderboard ? "Leaderboard Should be Shown" : "Leaderboard Will not be Displayed"
              }
              </div>
            </div>

          </div>
        }
        {
          !data.setting && <div>
            No Security Create.
          </div>
        }
        </div>
    </>
  )
}