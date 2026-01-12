export default function Loader({ type }) {
  if (type ===  "big")
    return (
      <>
        <div className="border-t-transparent border-4 rounded-full h-8 w-8 flex items-center justify-center animate-spin">
        </div>
      </>
    )
  else if(type === 'small')
    return (
      <>
        <div className="border-t-transparent border-4 rounded-full h-6 w-6 flex items-center justify-center animate-spin">
        </div>
      </>

    )
  else 
    return (
      <>
        <div className="border-t-transparent border-4 rounded-full h-4 w-4 flex items-center justify-center animate-spin">
        </div>
      </>

    )
}