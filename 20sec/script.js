let timeLeft = 20;
const timerElement = document.getElementById('timer-display');
const beepSound = document.getElementById('beep');
const timerButton = document.getElementById('timer-btn');

var countdown;

function startTimer() {

    timerButton.textContent = 'Stop Timer';
    timerElement.textContent = timeLeft; // start at 20 and go down

    countdown = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            beepSound.play();
        }
    }, 1000);
}

function stopTimer() {

    timerButton.textContent = 'Start Timer';

    timeLeft = 20;
    clearInterval(countdown);
}

timerButton.addEventListener('click', () => {
    if (timerButton.textContent === 'Start Timer') {
        startTimer();
    } else {
        stopTimer();
    }
});