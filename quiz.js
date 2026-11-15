// HTTP quiz: starts the timer, checks answers, and displays the results.
const quizForm = document.getElementById("http-quiz");
const timerDisplay = document.getElementById("timer");
const timerMessage = document.getElementById("timer-message");
const resultBox = document.getElementById("result");
const submitButton = document.getElementById("submit-quiz");
const resetButton = document.getElementById("reset-quiz");

const totalTime = 10 * 60; // Ten minutes, measured in seconds.
let timeLeft = totalTime;
let startTime = null;
let timerId = null;
let quizFinished = false;

// Correct answers and short explanations for the results section.
const answers = {
    q1: { answer: "transfer", display: "Transfer", explanation: "HTTP stands for Hypertext Transfer Protocol." },
    q2: { answer: "a", display: "The web browser (client)", explanation: "The browser acts as the client and sends a request to the server." },
    q3: { answer: "c", display: "GET", explanation: "GET is commonly used to request a resource." },
    q4: { answer: "tls", display: "TLS (Transport Layer Security)", explanation: "HTTPS uses TLS to protect information while it is in transit." },
    q5: { answer: "b", display: "The requested resource was not found", explanation: "A 404 status is a client error meaning the resource was not found." },
    q6: { answer: ["method", "target", "headers", "body"], display: "A method, request target, headers, and sometimes a message body", explanation: "An HTTP request commonly contains a method, target, headers, and sometimes a body." },
    q7: { answer: "b", display: "Multiplexing multiple streams over one TCP connection", explanation: "HTTP/2 allows multiple streams to share one TCP connection." },
    q8: { answer: "c", display: "UDP", explanation: "HTTP/3 uses QUIC, which operates over UDP." },
    q9: { answer: "a", display: "An HTTP response", explanation: "The server processes the request and sends an HTTP response." },
    q10: { answer: "c", display: "It encrypts information sent between the browser and server", explanation: "HTTPS uses TLS to encrypt information in transit and help authenticate the server." }
};

// Format seconds as minutes and seconds for the timer and final result.
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(secondsLeft).padStart(2, "0");
}

// Start counting only after the visitor begins answering the quiz.
function startTimer() {
    if (startTime === null && !quizFinished) {
        startTime = Date.now();
        timerMessage.textContent = "The ten-minute timer is running.";
        timerId = setInterval(function () {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);

            if (timeLeft <= 60) {
                timerDisplay.classList.add("timer-warning");
            }
            if (timeLeft <= 0) {
                finishQuiz(true);
            }
        }, 1000);
    }
}

// Return the visitor's answer in a format that can be compared.
function getAnswer(questionName) {
    if (questionName === "q1" || questionName === "q4") {
        return document.getElementById(questionName).value.trim().toLowerCase();
    }

    if (questionName === "q6") {
        return Array.from(document.querySelectorAll('input[name="q6"]:checked'))
            .map(function (choice) { return choice.value; }).sort();
    }

    const selected = document.querySelector('input[name="' + questionName + '"]:checked');
    return selected ? selected.value : "";
}

// Check whether the selected or typed answer matches the answer key.
function isCorrect(questionName, userAnswer) {
    const correctAnswer = answers[questionName].answer;

    if (questionName === "q1") {
        return userAnswer === "transfer";
    }
    if (questionName === "q4") {
        return userAnswer === "tls" || userAnswer === "transport layer security";
    }
    if (questionName === "q6") {
        return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer.slice().sort());
    }
    return userAnswer === correctAnswer;
}

// Create a readable description of what the visitor selected.
function showUserAnswer(questionName, userAnswer) {
    if (questionName === "q1") return userAnswer || "No answer";
    if (questionName === "q4") return userAnswer || "No answer";
    if (questionName === "q6") {
        if (userAnswer.length === 0) return "No selections";
        return userAnswer.map(function (value) {
            const labels = {
                method: "Request method", target: "Request target", headers: "Headers",
                body: "Message body", wallpaper: "Desktop wallpaper"
            };
            return labels[value];
        }).join(", ");
    }
    const selected = document.querySelector('input[name="' + questionName + '"]:checked');
    return selected ? selected.parentElement.textContent.trim() : "No answer";
}

// Stop the quiz and show the score plus feedback for every question.
function finishQuiz(timeExpired) {
    if (quizFinished) return;
    quizFinished = true;
    clearInterval(timerId);

    const elapsed = startTime === null ? 0 : Math.min(totalTime, Math.floor((Date.now() - startTime) / 1000));
    let score = 0;
    let review = "";

    Object.keys(answers).forEach(function (questionName, index) {
        const userAnswer = getAnswer(questionName);
        const correct = isCorrect(questionName, userAnswer);
        if (correct) score++;

        review += '<article class="answer-review ' + (correct ? "correct-answer" : "incorrect-answer") + '">';
        review += '<h3>Question ' + (index + 1) + ': ' + (correct ? "Correct" : "Incorrect") + '</h3>';
        review += '<p><strong>Your answer:</strong> ' + escapeHTML(showUserAnswer(questionName, userAnswer)) + '</p>';
        review += '<p><strong>Correct answer:</strong> ' + escapeHTML(answers[questionName].display) + '</p>';
        review += '<p>' + escapeHTML(answers[questionName].explanation) + '</p></article>';
    });

    const passed = score >= 7;
    const percent = score * 10;
    const timeText = formatTime(elapsed);
    resultBox.className = "result-box " + (passed ? "result-pass" : "result-fail");
    resultBox.innerHTML = '<h2>' + (passed ? "You Passed!" : "You Did Not Pass") + '</h2>' +
        '<p class="final-score">' + score + ' / 10 (' + percent + '%)</p>' +
        '<p><strong>Result:</strong> ' + (passed ? "Pass" : "Fail") + '</p>' +
        '<p><strong>Time spent:</strong> ' + timeText + (timeExpired ? ' (time limit reached)' : '') + '</p>' +
        '<h2>Question-by-question results</h2>' + review;

    resultBox.hidden = false;
    quizForm.querySelectorAll("input").forEach(function (field) { field.disabled = true; });
    submitButton.disabled = true;
    timerMessage.textContent = "Quiz submitted. Use Retake / Reset Quiz to try again.";
    resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Escape typed text before placing it into the results HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return replacements[character];
    });
}

// Start the timer when a visitor first interacts with a quiz input.
quizForm.addEventListener("input", startTimer);
quizForm.addEventListener("change", startTimer);

quizForm.addEventListener("submit", function (event) {
    event.preventDefault();
    startTimer();
    finishQuiz(false);
});

// Reset all answers, results, and the ten-minute timer for another attempt.
quizForm.addEventListener("reset", function () {
    clearInterval(timerId);
    setTimeout(function () {
        timeLeft = totalTime;
        startTime = null;
        timerId = null;
        quizFinished = false;
        timerDisplay.textContent = formatTime(totalTime);
        timerDisplay.classList.remove("timer-warning");
        timerMessage.textContent = "The timer starts when you begin the quiz.";
        resultBox.hidden = true;
        resultBox.innerHTML = "";
        resultBox.className = "result-box";
        quizForm.querySelectorAll("input").forEach(function (field) { field.disabled = false; });
        submitButton.disabled = false;
    }, 0);
});