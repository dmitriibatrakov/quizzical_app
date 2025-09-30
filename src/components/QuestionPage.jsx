import { useState, useEffect } from "react"
import { clsx } from "clsx"
import  he  from "he"

/* функция, возвращающая обновленный массив с 
данными с перемешаннми объектами */
import  { updatedQuizArr } from "./utils.js"
import { addUserAnswerIntoData } from "./utils.js"
import { translateData } from "./utils.js"

export default function QuestionPage(props) {

    const urlQuizQuery = `https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple`
    /* состояние хранения данных от АПИ */
    const [data, setData] = useState(null)
    /* состояние хранения корректных ответов пользователя */
    const [rightUserAnswCount, setRightUserAnswCount] = useState(null)
    /* состояние управления вызова к АПИ с вопросами */
    const [shouldFetch, setShouldFetch] = useState(true)
    /* состояние управления вызова к АПИ для перевода */
    const [shouldTranslate, setShouldTranslate] = useState(true)

    let quizElements = ""
    let tempData = []

    /* Запись ответа с АПИ с вопросами здесь, 
    триггер на shouldFetch, данные получены на английском языке */
    useEffect(()=> {
        if (shouldFetch === true) {
/*             console.log("Внутри useEffect с получением данных") */
            fetch(urlQuizQuery)
                .then(res=> res.json())
                .then(dataApi => {
                    setData(() => updatedQuizArr(dataApi.results)) 
/*                     console.log("Данные получены")
                    console.log(tempData) */
                    setRightUserAnswCount(null)
                    setShouldFetch(false)
                })
        }
    }, [shouldFetch])

    /* Перевод данных с АПИ, отправка данных на АПИ перевода, 
    триггер на shouldFetch */
    useEffect(() => {
        if(shouldFetch === false && shouldTranslate === true && data) {
            /* console.log("Внутри useEffect с переводом") */
            const doTranslate = async() => {
                const translated = await translateData(data)
                setData(translated)
                /* console.log("Данные вернулись") */
                setShouldTranslate(false)
            }

            doTranslate()
        }
    }, [shouldFetch, shouldTranslate, data])
    

    /* когда данные получены, отрисовать контент на странице */
    if (data != null && shouldTranslate === false) {
            console.log("отражается контент на странице")
            console.log(data)
            quizElements = data.map(function(question, indexQ){

                /* переменная с блоком ответов на вопрос */
                const answerEl = question.mixed_answers_ru.map(function(answer, indexA) {

                    /* Для корректной работы clsx */
                    const isRight = (rightUserAnswCount != null) && 
                    (question.user_answer === question.correct_answer_ru);
                    const isWrong = (rightUserAnswCount != null) && 
                    (question.user_answer != question.correct_answer_ru);
                    const isCorrect = isWrong && answer === question.correct_answer_ru
                    const labelClasses = clsx({"inter-text": true},
                        {"ranswer": isRight}, {"wanswer": isWrong}, {"correct": isCorrect}
                    )

                    return (
                        <div key={`q${indexQ}a${indexA}`} >
                            <input 
                                type="radio" 
                                id={answer} 
                                name={`q${indexQ}`} 
                                value={answer}
                                disabled={rightUserAnswCount != null}
                                required>
                            </input>
                            <label htmlFor={answer} className={labelClasses}>{answer}</label>
                        </div>
                    )
                })
                /* переменная с вопросом и с блоком ответов */
                return (
                    <div key={`q${indexQ}`} className="quiz-el">
                        <p className="bold-text">{he.decode(question.question_ru)}</p>
                            <div className="answers"> 
                                {answerEl}
                            </div>
                    </div>
                )
            })
    } else {
        console.log("ожидание данных")
    }

 /* функция изъятия данных из формы и подсчета правильных ответов */
function checkAnswers(e) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    /* сбор ответов пользователя */
    let usersAnswersTemp = []
    for (let pair of formData.entries()) {
        usersAnswersTemp = [...usersAnswersTemp, pair[1]]
    }
    console.log(usersAnswersTemp)
    setData(prevData => addUserAnswerIntoData(prevData, usersAnswersTemp))


    /* создана локальная переменная, 
    в которую вычислится число правильных ответов пользователя, 
    и произойдет последующая запись в useState*/
    let countRightAnswers = 0 

    data.forEach(function(question, index) {
            if (question.correct_answer_ru === usersAnswersTemp[index]) {
            countRightAnswers = countRightAnswers + 1
            }
        })

    /* запись в useState, что бы реакт узнал об изменении */  
    setRightUserAnswCount(countRightAnswers)
}

console.log(`state ${rightUserAnswCount}`) /* корректно подсчитано сколько верных ответов у пользователя */
    if (!data || shouldTranslate) {
        return <p>Переводим вопросы :)</p>
    } 
    return (
        <section className="quiz-section">
            <form onSubmit={checkAnswers}>
                <div>{quizElements}</div>
                {rightUserAnswCount === null && (<button 
                    className="system-btn check-btn">
                    Проверить ответы
                </button>)}
            </form>
            {rightUserAnswCount != null && 
                <div className="result-section">
                    <p className="bold-text">
                        {rightUserAnswCount ===0 ? 
                        `Ни одного правильного ответа` :
                        `Правильный ответ по ${rightUserAnswCount} из ${data.length} вопросам.`}
                    </p>
                    <button className="system-btn check-btn" onClick={props.startToggle}>
                        К стартовой странице.</button>
                </div>
            }
        </section>
    )
}



