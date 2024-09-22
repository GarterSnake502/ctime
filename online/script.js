let username = document.cookie;

if (document.cookie == "") { // document.cookie is the username
    changeUser();
}

let users = ["josiah", "jackson", "olivia", "wyatt", "noah", "sammy"];


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
document.getElementById('book-select').addEventListener('change', function() {
    updateChapterOptions();
    displayHighScores();
});
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

    const key = `${username}-${book}-${chapter}`; // format

    getTime(username, book, chapter).then((score) => { // to await promise
        console.log('Current highscore and lastscore: ', score); // log for debug
        if (!score) { // if there is no highscore
            console.log('no highscore, creating a new one with the following variables: ', username, book, chapter, time, time);
            submitTime(username, book, chapter, time, time); // create one
        } else {
            const highscore = score.highscore; // set some
            const lastscore = score.lastscore; // variables
    
            if (time < highscore) { // if your score is better
                submitTime(username, book, chapter, time, time); // update the highscore and lastscore
            } else {
                submitTime(username, book, chapter, highscore, time); // just update the lastscore
            }
        }
    }); // fetch current highscore and lastscore



    displayHighScores(); // display the highscores
}

// Function to display high scores
function displayHighScores() {

    // clear the highscores
    const highScoresDiv = document.getElementById('high-scores');
    highScoresDiv.innerHTML = '<h2>High Score</h2><br>loading...';
    setTimeout(() => { // waits one second to give it time to fetch
        highScoresDiv.innerHTML = '<h2>High Score</h2>';
        users.forEach(user => {
            getTime(user, document.getElementById('book-select').value, document.getElementById('chapter-select').value).then((userScores) => { // fetch the highscores, then...
                if (userScores) {
                    console.log(userScores); // log them for debug
                    const highScoreDiv = document.createElement('div'); // then create user interface
                    highScoreDiv.innerHTML = `<b>${user}</b> | high: ${userScores.highscore}&nbsp&nbsp&nbsplast: ${userScores.lastscore}`;
                    highScoresDiv.appendChild(highScoreDiv);
                }
            });
        });
    }, 1000);
}


//          SAVE BUTTON          //

document.getElementById('chapter-select').addEventListener('change', function() {
    disableSave(); // prevent you from saving somewhere else
    displayHighScores(); // display the highscores
});

function disableSave() {
    document.getElementById('save-btn').setAttribute("disabled", "");
}

function enableSave() {
    document.getElementById('save-btn').removeAttribute("disabled");
}


//          UPLOAD SCORES TO SERVER          //


function submitTime(user, book, chapter, high, last) {
    console.log(`Submitting to https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${user}-${book}-${chapter} with data: ${high}, ${last}`);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${user}-${book}-${chapter}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        highscore: high,
        lastscore: last
    }));
    
}

async function getTime(user, book, chapter) { // IMPORTANT: will return promise, must manage data outside of function with .then()
    console.log(`Fetching from https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${user}-${book}-${chapter}`); // format: .then (data => console.log(data))
    const url = `https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${user}-${book}-${chapter}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store' // to make sure it is the latest data
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function deleteTime(user, book, chapter) {
    fetch(`https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${user}-${book}-${chapter}`, {
        method: "DELETE"
    });
}

//          MISC          //
function changeUser() {
    document.cookie = "";
    username = prompt("Please enter your username:\n\nthe current options are:\njosiah\njackson\nolivia\nwyatt\nnoah\n\nsammy\nPlease don't choose anything else--doing so will glitch the database");
    document.cookie = `${username}`;
}


// Display high scores on page load
window.onload = displayHighScores;
updateChapterOptions(); // so that you can select a chapter without having to select James first
deleteTime("the mule", "Month", 1); // delete a highscore