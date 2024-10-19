document.addEventListener("DOMContentLoaded", () => {
    let startBtn = document.querySelector(".start");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            window.location.href = "UserDetails.html"; 
        });
    }
  });
  
  // Initialize users, scores, and highest scores from localStorage
  let users = JSON.parse(localStorage.getItem("users")) || []; // Retrieve users from localStorage
  let scores = JSON.parse(localStorage.getItem("scores")) || []; // Retrieve scores from localStorage
  let highestScores = JSON.parse(localStorage.getItem("highestScores")) || []; // Retrieve highest scores from localStorage
  
  let submitBtn = document.querySelector(".submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
        userDetails(); // Save user details
        window.location.href = "questions.html"; 
    });
  }
  
  window.onload = () => {
    if (window.location.pathname.includes("questions.html")) {
        getQuestions(); 
        buttonHandling(); 
    } else if (window.location.pathname.includes("scores.html")) { // Check if on scores page
        displayScores(); // Display scores
    }
  };
  
  let url = "https://opentdb.com/api.php?amount=5&category=17&difficulty=easy";
  let currQuesIdx = 0;
  let highScore = 0;
  let score = 0;
  let timer;
  let timeLeft = 10;
  let questions = [];
  
  function userDetails() {
    let userName = document.querySelector("#name").value.trim(); // Get username
    if (userName !== "") { // Check if name is not empty
        users.push(userName); // Add username to array
        localStorage.setItem("users", JSON.stringify(users)); // Save users to localStorage
        document.querySelector("#name").value = ""; // Clear input field
    }
  }
  
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
  
        document.querySelector(".questions").innerText = decodeHTML(currQues.question);
        document.querySelector(".current-ques-num").innerText = `Q. ${currQuesIdx + 1}/${questions.length}`;
  
        // Display options
        document.querySelector(".option-a").innerText = `A) ${decodeHTML(options[0].text)}`;
        document.querySelector(".option-b").innerText = `B) ${decodeHTML(options[1].text)}`;
        document.querySelector(".option-c").innerText = `C) ${decodeHTML(options[2].text)}`;
        document.querySelector(".option-d").innerText = `D) ${decodeHTML(options[3].text)}`;
  
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
  
  // Function to decode HTML entities
  function decodeHTML(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
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
  
    document.querySelector(".correct-answer").innerText = `Correct Answer: ${decodeHTML(correctAnswerText)}`;
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
    document.querySelector(".timer").innerText = timeLeft; // Initialize timer display
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
    document.querySelector(".correct-answer").innerText = `Correct Answer: ${decodeHTML(questions[currQuesIdx].correct_answer)}`;
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
        <div class="final-score" style="color:white; text-align:center;">
            <h1 style="color:white;">Quiz Finished</h1>
            <p>Your final score is: ${score}/${questions.length * 2}</p>
            <p>Your highest score is: ${getHighestScore()}</p> <!-- Display the highest score -->
        </div>
        <div class="replay" style="margin:10px;">
            <i class="fa-solid fa-repeat"></i>
            <button class="play-again">Play Again</button> <!-- Button text for replay -->
        </div>
        <div class="Quit" style="margin:10px;">
            <i class="fa-solid fa-xmark"></i>
            <button class="quit">Quit</button> <!-- Button text for quitting -->
        </div>`;
  
    // Save the current score to scores array and localStorage
    scores.push(score); // Add current score to scores array
    localStorage.setItem("scores", JSON.stringify(scores)); // Save updated scores array to localStorage
  
    // Update highest score
    updateHighestScore(score); // Update highest score for the user
  
    let playAgain = document.querySelector(".play-again");
    if (playAgain) {
        playAgain.addEventListener("click", () => {
            // Reset current index and score for a new game
            currQuesIdx = 0;
            score = 0;
            // Redirect to user details page to start a new quiz
            window.location.href = "UserDetails.html"; 
        });
    }
    
    let quitBtn = document.querySelector(".quit");
    if (quitBtn) {
        quitBtn.addEventListener("click", () => {
            displayScores(); // Show scores before quitting
        });
    }
  }
  
  // Get highest score from localStorage
  function getHighestScore() {
    const userIndex = users.length - 1; // Get the index of the last user
    return highestScores[userIndex] || 0; // Return the user's highest score or 0 if no score
  }
  
  // Update the highest score
  function updateHighestScore(currentScore) {
    const userIndex = users.length - 1; // Get the index of the last user
    if (highestScores[userIndex] === undefined || currentScore > highestScores[userIndex]) {
        highestScores[userIndex] = currentScore; // Update highest score for the user
    }
    localStorage.setItem("highestScores", JSON.stringify(highestScores)); // Save updated highest scores to localStorage
  }
  
  // Function to display all scores in a table
  function displayScores() {
    document.body.innerHTML = `<h1 style="color:white; text-align:center;">User Scores</h1>`;
    
    // Create a table for displaying scores
    let scoresTable = document.createElement("table");
    scoresTable.style.color = "black";
    scoresTable.style.border="2px solid white";
    scoresTable.style.borderRadius="4px";
    scoresTable.style.backgroundColor="lightblue"; 
    scoresTable.style.width = "100%"; // Set table width
    scoresTable.style.borderCollapse = "collapse"; // Collapse borders
  
    // Create table header
    let headerRow = document.createElement("tr");
    let headers = ["Rank", "User", "Score", "Highest Score"];
    headers.forEach(headerText => {
        let header = document.createElement("th");
        header.innerText = headerText;
        header.style.color="black";
        header.style.border = "1px solid white"; // Add border
        header.style.borderRadius="2px";
        header.style.padding = "10px"; // Add padding
        header.style.textAlign = "center"; // Center align
        headerRow.appendChild(header);
    });
    scoresTable.appendChild(headerRow); // Add header row to table
  
    // Prepare an array of score objects for sorting
    let scoreEntries = users.map((user, index) => {
        return {
            user,
            score: scores[index] || 0,
            highestScore: highestScores[index] || 0
        };
    });
  
    // Sort the score entries by score in descending order
    scoreEntries.sort((a, b) => b.score - a.score);
  
    // Populate the table with scores
    scoreEntries.forEach((entry, index) => {
        let row = document.createElement("tr");
        row.style.border = "1px solid white"; // Add border to row
        row.style.borderRadius="2px";
        let rankCell = document.createElement("td");
        rankCell.innerText = index + 1; // Rank
        rankCell.style.color="black";
        rankCell.style.border = "1px solid white"; // Add border
        rankCell.style.borderRadius="4px";
        rankCell.style.padding = "10px"; // Add padding
        rankCell.style.textAlign = "center"; // Center align
        row.appendChild(rankCell);
  
        let userCell = document.createElement("td");
        userCell.style.color="black";
        userCell.innerText = entry.user; // User name
        userCell.style.border = "1px solid white"; // Add border
        userCell.style.borderRadius="2px";
        userCell.style.padding = "10px"; // Add padding
        userCell.style.textAlign = "center"; // Center align
        row.appendChild(userCell);
  
        let scoreCell = document.createElement("td");
        scoreCell.style.color="black";
        scoreCell.innerText = entry.score; // User score
        scoreCell.style.border = "1px solid white"; // Add border
        scoreCell.style.borderRadius="2px";
        scoreCell.style.padding = "10px"; // Add padding
        scoreCell.style.textAlign = "center"; // Center align
        row.appendChild(scoreCell);
  
        let highestScoreCell = document.createElement("td");
        highestScoreCell.style.color="black";
        highestScoreCell.innerText = entry.highestScore; // User highest score
        highestScoreCell.style.border = "1px solid white"; // Add border
        highestScoreCell.style.borderRadius="2px";
        highestScoreCell.style.padding = "10px"; // Add padding
        highestScoreCell.style.textAlign = "center"; // Center align
        row.appendChild(highestScoreCell);
  
        scoresTable.appendChild(row); // Add the row to the table
    });
  
    // Append the table to the document body
    document.body.appendChild(scoresTable);
  
    // Add a back button
    let backBtn = document.createElement("button");
    backBtn.innerText = "Back to Quiz";
    backBtn.style.color="white";
    backBtn.style.backgroundColor="#FF6F61";
    backBtn.style.border="2px solid #37ee0e";
    backBtn.style.borderRadius="5px";
    backBtn.style.marginTop = "20px"; 
    backBtn.addEventListener("click", () => {
        window.location.href = "questions.html"; // Go back to questions page
    });
    document.body.appendChild(backBtn); // Append back button
  }