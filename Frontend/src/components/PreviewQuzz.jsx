import { Check, List, CheckSquare, AlignLeft } from "lucide-react";

export default function PreviewQuzz({ data }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'option': return <List size={14} />;
      case 'checkbox': return <CheckSquare size={14} />;
      case 'textfield': return <AlignLeft size={14} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-start w-full text-[#EEEEEE]">
      

      <div className="flex flex-col w-full gap-2 border-b border-[#333333] pb-3 mb-5">
        <h2 className="text-lg font-semibold text-[#EEEEEE]">
          Quiz Preview
        </h2>
        <p className="text-sm text-[#AAAAAA]">
          {data.questions.length} question{data.questions.length !== 1 ? 's' : ''} total
        </p>
      </div>


      <div className="flex flex-col gap-4 w-full pb-4">
        {data.questions.map((question, index) => {
          const isRadio = question.type === 'option';
          
          return (
            <div 
              className="flex flex-col w-full bg-[#1A1A1A] border border-[#333333] rounded-md p-4 sm:p-5 gap-3" 
              key={`question-${index}`}
            >
              
   
              <div className="flex items-start justify-between gap-4 w-full">
                <div className="text-base font-medium text-[#EEEEEE] leading-relaxed">
                  <span className="text-[#888888] mr-2">{index + 1}.</span>
                  {question.question}
                </div>
                
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#222222] border border-[#444444] rounded text-xs font-medium text-[#AAAAAA] whitespace-nowrap capitalize">
                  {getTypeIcon(question.type)}
                  <span className="hidden sm:inline">{question.type}</span>
                </div>
              </div>

           
              <div className="flex flex-col pl-6 mt-1 gap-2 w-full">
                
                {(question.type === 'option' || question.type === 'checkbox') && 
                  question.options.map((option, index2) => {
                    if (String(option.value).toLowerCase() === "n/a") return null;

                    const isCorrect = option.answer === true;

                    return (
                      <div 
                        className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                          isCorrect 
                            ? "bg-[#DE5833]/10 border-[#DE5833]/50" 
                            : "bg-[#222222] border-[#333333]"
                        }`} 
                        key={`option-${index}-${index2}`}
                      >
                    
                        <div 
                          className={`shrink-0 flex items-center justify-center w-4.5 h-4.5 mt-0.5 border ${
                            isRadio ? "rounded-full" : "rounded-sm"
                          } ${
                            isCorrect 
                              ? "bg-[#DE5833] border-[#DE5833] text-white" 
                              : "border-[#555555] bg-[#1A1A1A]"
                          }`}
                        >
                          {isCorrect && <Check size={12} strokeWidth={3} />}
                        </div>
                        
                        {/* Option Text */}
                        <div className={`text-sm leading-snug ${isCorrect ? "text-[#EEEEEE] font-medium" : "text-[#AAAAAA]"}`}>
                          {option.value}
                        </div>
                      </div>
                    );
                  })
                }

  
                {question.type === 'textfield' && (
                  <div className="w-full h-24 bg-[#222222] border border-[#333333] rounded-md p-3 text-sm text-[#666666] italic flex items-start">
                    User will input text here...
                  </div>
                )}
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}