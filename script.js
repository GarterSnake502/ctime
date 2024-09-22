
//          VARIABLES           //


// Object containing the number of chapters for each book
const chapters = {
    Romans: 16,
    James: 5,
    Month: 7,
    Everything: 1
};


//          CHAPTER OPTIONS BUTTON           //


// Function to update chapter options based on selected book
function updateChapterOptions() {
    const book = document.getElementById('book-select').value;
    const chapterSelect = document.getElementById('chapter-select');
    chapterSelect.innerHTML = '';
    for (let i = 1; i <= chapters[book]; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Chapter ${i}`;
        chapterSelect.appendChild(option);
    }

    disableSave();
}

// Event listener to update chapter options when book selection changes
document.getElementById('book-select').addEventListener('change', updateChapterOptions);
window.onload = updateChapterOptions;


//          TIMER MANAGEMENT           //


// Timer variables
let timer;
let startTime;
let running = false;

let elapsedTime = 0; // only updates when you click STOP

    //          TIMER BUTTONS          //


// Event listener for start/stop button
document.getElementById('start-stop-btn').addEventListener('click', function() {

    disableSave(); // make it so you can't save while running--empty string means true

    if (running) {
        clearInterval(timer);
        running = false;
        this.textContent = 'Start';
        elapsedTime = (Date.now() - startTime) / 1000;

        enableSave(); // so you can click, 'save'

    } else {
        startTime = Date.now();
        timer = setInterval(updateTimer, 100);
        running = true;
        this.textContent = 'Stop';
    }
});

// Even listener for Save Score button
document.getElementById('save-btn').addEventListener('click', function() { //   gets the book and chapter, then updates the high score
    const book = document.getElementById('book-select').value; //               Can be launched anytime, make sure it is disabled
    const chapter = document.getElementById('chapter-select').value;
    updateHighScore(book, chapter, elapsedTime);

    disableSave(); // so you can't save twice
});

// Function to update the timer display
function updateTimer() {
    const elapsedTime = (Date.now() - startTime) / 1000;
    document.getElementById('timer-display').textContent = elapsedTime.toFixed(2);
}



//          HIGH SCORE MANAGEMENT           //


// Function to update high scores
function updateHighScore(book, chapter, time) {
    const highScores = getHighScores();
    const key = `${book}-${chapter}`;
    if (!highScores[key] || time < highScores[key]) {
        highScores[key] = time;
        document.cookie = `highScores=${JSON.stringify(highScores)}; path=/`;
    }
    displayHighScores();
}

// Function to get high scores from cookies
function getHighScores() {
    const cookies = document.cookie.split('; ');
    const highScoreCookie = cookies.find(cookie => cookie.startsWith('highScores='));

    if (highScoreCookie) {
        return JSON.parse(highScoreCookie.split('=')[1]);
    }
    return {};
}

// Function to display high scores
function displayHighScores() {
    const highScores = getHighScores();
    const highScoresDiv = document.getElementById('high-scores');
    highScoresDiv.innerHTML = '<h2>High Scores</h2>';
    const book = document.getElementById('book-select').value;
    const chapter = document.getElementById('chapter-select').value;
    const currentKey = `${book}-${chapter}`;

    // Sort keys by book and chapter
    const sortedKeys = Object.keys(highScores).sort((a, b) => {
        const [bookA, chapterA] = a.split('-');
        const [bookB, chapterB] = b.split('-');
        if (bookA < bookB) return -1;
        if (bookA > bookB) return 1;
        return parseInt(chapterA) - parseInt(chapterB);
    });

    // Display the currently selected book and chapter at the top in bold
    if (highScores[currentKey]) {
        highScoresDiv.innerHTML += `<p><strong>${book} ${chapter}:</strong> <a href="#" onclick="deleteHighScore('${currentKey}')">${highScores[currentKey].toFixed(2)} seconds</p>`;
    }

    for (const key of sortedKeys) {
        if (key === currentKey) continue; // Skip the current key as it's already displayed
        const [book, chapter] = key.split('-');
        highScoresDiv.innerHTML += `<p>${book} ${chapter}: <a href="#" onclick="deleteHighScore('${key}')">${highScores[key].toFixed(2)} seconds</a></p>`;
    }
}

// Function to delete a high score
function deleteHighScore(key) {
    const highScores = getHighScores();
    delete highScores[key];
    document.cookie = `highScores=${JSON.stringify(highScores)}; path=/`;
    displayHighScores();
}


//          SAVE BUTTON          //

document.getElementById('chapter-select').addEventListener('change', function() {
    disableSave();
    displayHighScores(); // to update bolded score at top
}); // prevent you from saving somewhere else

function disableSave() {
    document.getElementById('save-btn').setAttribute("disabled", "");
}

function enableSave() {
    document.getElementById('save-btn').removeAttribute("disabled");
}


// Display high scores on page load
window.onload = displayHighScores;
updateChapterOptions(); // so that you can select a chapter without having to select James first
