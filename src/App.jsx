import { useState } from 'react'

import IntroPage from "./components/IntroPage"
import QuestionPage from './components/QuestionPage'


export default function App() {

  const [isStarted, setIsStarted] = useState(true)
  function startToggle() {
    console.log(isStarted)
    setIsStarted(prevState => !prevState)
    console.log("clicked!")
  }

  return (
    <>
      {isStarted ? <IntroPage startToggle={startToggle} /> : <QuestionPage startToggle={startToggle}/> }
    </>
  )
}

