document.addEventListener("DOMContentLoaded", () => {
    let startBtn = document.querySelector(".start");
    startBtn.addEventListener("click", () => {
        window.location.href = "questions.html"; 
    });
});

window.onload = () => {
    if (window.location.pathname.includes("questions.html")) {
        getQuestions(); 
        buttonHandling(); 
    }
};

let url = "https://opentdb.com/api.php?amount=5&category=17&difficulty=easy";
let currQuesIdx = 0;
let score = 0;
let timer;
let timeLeft = 10;
let questions = [];

// Fetch questions from the API
async function getQuestions() {
    try {
        let res = await axios.get(url);
        questions = res.data.results; 
        displayQuestions(); 
        setTimer(); 
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}


function displayQuestions() {
    if (currQuesIdx < questions.length) {
        let currQues = questions[currQuesIdx];

        
        let options = [
            { text: currQues.correct_answer, isCorrect: true },
            { text: currQues.incorrect_answers[0], isCorrect: false },
            { text: currQues.incorrect_answers[1], isCorrect: false },
            { text: currQues.incorrect_answers[2], isCorrect: false }
        ];
        options = shuffle(options);

        
        document.querySelector(".questions").innerText = currQues.question;
        document.querySelector(".current-ques-num").innerText = `Q. ${currQuesIdx + 1}/${questions.length}`;

        // Display options
        document.querySelector(".option-a").innerText = `A) ${options[0].text}`;
        document.querySelector(".option-b").innerText = `B) ${options[1].text}`;
        document.querySelector(".option-c").innerText = `C) ${options[2].text}`;
        document.querySelector(".option-d").innerText = `D) ${options[3].text}`;

        // Clear previous background colors
        document.querySelectorAll(".option").forEach(option => {
            option.style.backgroundColor = '';  // Reset background
        });
        // Add click event listeners for each option
        document.querySelectorAll(".option-container .option").forEach((optionElement, idx) => {
            optionElement.onclick = () => {
                checkAnswer(options[idx].isCorrect, optionElement);
            };
        });
    } else {
        showFinalScore(); // If no more questions, show final score
    }
}


function checkAnswer(isCorrect, selectedOptionElement) {
    
    const correctAnswerText = questions[currQuesIdx].correct_answer;

    if (isCorrect) {
        
        selectedOptionElement.style.backgroundColor = "#4CAF50"; // Light green shade
        score += 2; // Increment score
        document.querySelector(".score").innerText = `Score: ${score}`; // Update score display
    } else {
        selectedOptionElement.style.backgroundColor = "#f44336"; // Red shade
    }
    
    
    document.querySelector(".correct-answer").innerText = `Correct Answer: ${correctAnswerText}`;
    document.querySelector(".correct-answer").style.display = "block"; // Show correct answer
    
    
    setTimeout(nextQuestion, 2000); // Wait for 2 seconds before moving to the next question
}

// Shuffle options
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function setTimer() {
    clearInterval(timer); // Clear previous timer
    timeLeft = 10;
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            showCorrectAnswer();
            clearInterval(timer);
            setTimeout(nextQuestion, 2000); // Move to next question after showing correct answer
        } else {
            document.querySelector(".timer").innerText = timeLeft;
            timeLeft--;
        }
    }, 1000);
}


function showCorrectAnswer() {
    clearInterval(timer); // Stop timer
    document.querySelector(".correct-answer").innerText = `Correct Answer: ${questions[currQuesIdx].correct_answer}`;
    document.querySelector(".correct-answer").style.display = "block";
}


function nextQuestion() {
    currQuesIdx++; 
    if (currQuesIdx < questions.length) { 
        document.querySelector(".correct-answer").innerText = ""; 
        displayQuestions(); // Display the next question
        setTimer(); // Restart timer
    } else {
        showFinalScore(); // If no more questions, end quiz
    }
}

// Handle navigation buttons
function buttonHandling() {
    document.querySelector(".fa-arrow-right").addEventListener("click", () => {
        clearInterval(timer); // Clear the timer before moving to the next question
        nextQuestion(); // Move to the next question
    });
    document.querySelector(".fa-arrow-left").addEventListener("click", () => {
        if (currQuesIdx > 0) {
            currQuesIdx--; // Go back to the previous question
            document.querySelector(".correct-answer").innerText = ""; // Clear correct answer display
            displayQuestions(); // Display previous question
            setTimer(); // Restart timer
        }
    });
}

function showFinalScore() {
    clearInterval(timer);
    document.body.innerHTML = `
        <div class="final-score"  style="color:white; text-align:center;">
            <h1 style="color:white;">Quiz Finished</h1>
            <p>Your final score is: ${score}/${questions.length * 2}</p>
        </div>
    `;
}
