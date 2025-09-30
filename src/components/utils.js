/* Доработка полученного ответа от API. 
Реализовано перемешивание ответов, в этом же разделе 
в будущем реализовать перевод вопросов */
export function updatedQuizArr(arr) {
    return arr.map(function(question){
        const allAnswers = [...question.incorrect_answers, question.correct_answer]
        const mixedAnswers = mixAllAnswers(allAnswers)
        return {...question,
                mixed_answers: [...mixedAnswers],
                question_ru: question.question,
                correct_answer_ru: question.correct_answer,
                mixed_answers_ru: [...mixedAnswers]
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


export async function translateData(data) {
    const trApiUrl = import.meta.env.VITE_API_RAPIDAPI_URL
    const trApiKey = import.meta.env.VITE_API_RAPIDAPI_KEY
    const trApiHost = import.meta.env.VITE_API_RAPIDAPI_HOST

    const prepDataRu = {}
    data.forEach((question, indexQ) => {
        const answObj = {}
        question.mixed_answers_ru.forEach(function(answer, indexA) {
            answObj[`a${indexA+1}`] = answer
        })

        prepDataRu[`q${indexQ}`] = {
                question_ru: question.question_ru,
                correct_answer_ru: question.correct_answer_ru,
                mixed_answers_ru: answObj
        }
    })
    if (prepDataRu != {}) {
        console.log("готовится запрос к АПИ с переводом")
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key':  `${trApiKey}`,
                'x-rapidapi-host': `${trApiHost}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                origin_language: 'en',
                target_language: 'ru',
                words_not_to_translate: 'Earbuds; New York',
                paths_to_exclude: 'product.media.img_desc',
                common_keys_to_exclude: 'name; price',
                json_content: prepDataRu
            })
        };

        try {
            /* console.log(options) */
            const response = await fetch(trApiUrl, options);
            const result = await response.text();
/*             console.log("Возвращенный результат")
            console.log(JSON.parse(result).translated_json) */

            let returnedRuData = Object.values(JSON.parse(result).translated_json)
            returnedRuData.forEach(function(question) {
                question.mixed_answers_ru = Object.values(question.mixed_answers_ru)
            })
/*             console.log("Сейчас будет нормальный RU массив")
            console.log(returnedRuData) */

            const newEnRuData = data.map(function(question,indexQ) {
                    return {...question, 
                    question_ru: returnedRuData[indexQ].question_ru,
                    correct_answer_ru: returnedRuData[indexQ].correct_answer_ru,
                    mixed_answers_ru: returnedRuData[indexQ].mixed_answers_ru
                    }
            })
/*             console.log("Проверка возвращаемх данных")
            console.log(newEnRuData) */
            return Promise.all(newEnRuData)

        } catch (error) {
            console.error(error);
        }
    } /* Конец IF блока */
}
