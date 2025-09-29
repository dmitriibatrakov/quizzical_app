/* Доработка полученного ответа от API. 
Реализовано перемешивание ответов, в этом же разделе 
в будущем реализовать перевод вопросов */
export function updatedQuizArr(arr) {
    return arr.map(function(question){
        const allAnswers = [...question.incorrect_answers, question.correct_answer]
        const mixedAnswers = mixAllAnswers(allAnswers)
        return {...question,
                mixed_answers: [...mixedAnswers]
        }
    })
}

/* алгоритм Фишера-Йетса для возврата перемешанного массива с ответами */
function mixAllAnswers(array) {
    for (let i = array.length-1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1 ));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

export function addUserAnswerIntoData(arr, usersAnswersTemp) {
    return arr.map(function(question, index){
        return {...question,
                user_answer: usersAnswersTemp[index]
        }
    })
}