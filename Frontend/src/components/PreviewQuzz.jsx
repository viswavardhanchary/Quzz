import { Check } from "lucide-react";

export default function PreviewQuzz({ data }) {
  return (
    <>
      <div className="flex flex-col items-start gap-5 p-2 w-full">
        <div className="flex flex-col items-center w-full gap-1">
          <h1 className="text-2xl text-[#ff9100] text-center w-full">Preview Quizze</h1>
          <div className="border border-white w-[10%]"></div>
        </div>
        {
          data.questions.map((question, index) => {
            return <div className="flex flex-col items-start gap-1 w-full" key={`question${index}`}>
              <div className="flex items-center text-xl text-orange-500 border border-gray-500 rounded-md p-1 w-full bg-gray-600/50 wrap-break-words whitespace-normal">{index + 1}. {question.question}</div>
              <div className="text-lg mt-2 mb-2">Type: <span className="text-blue-400 border border-gray-500 rounded-md p-1  bg-gray-600/50">{question.type}</span></div>
              <div className="flex flex-col pl-10 items-start gap-2 w-full">{
                (question.type === 'option' || question.type === 'checkbox') && question.options.map((option, index2) => {
                  return <div className="flex items-center gap-2 w-full" key={`options${index}${index2}`}>
                    <div className={`flex item-center justify-center text-black border border-white w-5 h-5 ${question.type === 'option' ? "rounded-full" : "rounded-xs"} ${option.answer === true && "bg-green-500"}`}>
                      {option.answer === true && <Check size={16} />}
                    </div>
                    <div className="text-md border border-gray-500 rounded-md p-1 w-full bg-gray-600/50 wrap-break-words whitespace-normal">{option.value}</div>
                  </div>
                })
              }</div>
            </div>
          })
        }
      </div>
    </>
  )
}