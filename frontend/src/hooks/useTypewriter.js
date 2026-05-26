import { useState, useEffect } from "react"

const useTypewriter = (text, speed = 30) => {
  const [displayedText, setDisplayedText] = useState("")
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!text) return

    setDisplayedText("")
    setIsDone(false)

    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsDone(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return { displayedText, isDone }
}

export default useTypewriter