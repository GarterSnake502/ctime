
// this line initializes the user database so displayHighScores knows what to do. Don't move, or else the functions won't know what users is
let users = []; // start empty, then add from save

fetchUsers().then((data) => { // gets the latest user data from server
    users = data.registeredUsers; // logs the users for debug
    displayHighScores(); // displays the highscores for the current chapter
});


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
async function updateHighScore(book, chapter, time) {

    document.getElementById('high-scores').innerHTML = '<h2>High Score</h2><div>loading...</div>'; // clear the highscores

    const key = `${username}-${book}-${chapter}`; // format

    getTime(username, book, chapter).then((score) => { // to await promise
        console.log('Current highscore and lastscore: ', score); // log for debug
        if (!score) { // if there is no highscore
            console.log('no highscore, creating a new one with the following variables: ', username, book, chapter, time, time);
            submitTime(username, book, chapter, time, time); // create one
        } else {
            let highscore = score.highscore; // set some variables
    
            if (time < highscore) { // if your score is better
                highscore = time; // change the highscore to your new time
            }

            submitTime(username, book, chapter, highscore, time); // submit your new scores to the server--submitTime will automatically displayHighScores

        }
    }); // fetch current highscore and lastscore

}

// Function to display high scores
async function displayHighScores() {

    console.log(`Displaying high scores for ${users}`); // log for debug

    let currentBook = document.getElementById('book-select').value;
    let currentChapter = document.getElementById('chapter-select').value;

    // clear the highscores
    const highScoresDiv = document.getElementById('high-scores');
    highScoresDiv.innerHTML = '<h2>High Score </h2>';
    const userScoresPromises = users.map(user => 
        getTime(user, currentBook, currentChapter).then(userScores => ({ user, userScores }))
    );

    Promise.all(userScoresPromises).then(userScoresArray => {
        userScoresArray
            .filter(({ userScores }) => userScores) // filter out users with no scores
            .sort((a, b) => a.userScores.highscore - b.userScores.highscore) // sort by highscore
            .forEach(({ user, userScores }) => {
                console.log(userScores); // log them for debug
                const highScoreDiv = document.createElement('div'); // then create user interface
                highScoreDiv.innerHTML = `<b>${user}</b> | high: ${userScores.highscore}&nbsp&nbsp&nbsplast: ${userScores.lastscore}`;
                highScoresDiv.appendChild(highScoreDiv);
            });
    });
    alert("finished displaying high scores");
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


// IMPORTANT: THIS IS USING XHR, NOT FETCH API. YOU PROBABLY WANT TO CHANGE THAT NOW!!!!
async function submitTime(vuser, vbook, vchapter, vhigh, vlast) { //  v's are so that you can enter "user, book, chapter" as the first three arguments
    console.log(`Submitting to https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${vuser}-${vbook}-${vchapter} with data: ${vhigh}, ${vlast}`);
    const url = `https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${vuser}-${vbook}-${vchapter}`;
    const data = { highscore: vhigh, lastscore: vlast };
    
    try {
        const response = await fetch(url, { // variable for later--await makes it so that it doesn't display until POST is finished
            method: 'POST', 
            cahce: 'no-store', // to make sure it is the latest data
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })

        await response.text();
        displayHighScores(); // display the highscores--put here so that it only displays after the highscore is updated
    } catch (error) {
        console.error('Error submitting data:', error);
    }

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

async function deleteTime(vuser, vbook, vchapter) { //  v's are so that you can enter "user, book, chapter" as the first three arguments without it defaulting
    console.log(`Deleting from https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${vuser}-${vbook}-${vchapter}`);
    try {
        const response = await fetch(`https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/${vuser}-${vbook}-${vchapter}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

//          MISC          //
function changeUser() {
    document.cookie = "";
    username = prompt("Enter your your name, no caps or spaces.\n\nPlease only do one username per person--my backend server can only hold so much, and each username adds about ~.1 seconds to the load speed of the high scores. Thanks!");
    username = username.toLowerCase(); // to make sure it is lowercase
    username = username.replace(/\s/g, ''); // to remove spaces
    if (users.includes(username)) {
        console.log(`Username changed to ${username}`);
    } else {
        console.log(`Username changed to ${username} and registered`);
        registerNew(username);
    }
    document.cookie = `${username}`;

    fetchUsers().then((data) => function() {
        users = data.registeredUsers;
    }); // to refresh the users list
}

document.getElementById('delete-time').addEventListener('click', function() {
    document.getElementById('high-scores').innerHTML = '<h2>High Score</h2><div>loading...</div>';
    const book = document.getElementById('book-select').value;
    const chapter = document.getElementById('chapter-select').value;
    deleteTime(username, book, chapter).then(() => {
        displayHighScores();
    });
});


//          FETCH USER DATABASE          //

let username = ""; // start empty, then add from cookie
if (document.cookie == "") { // document.cookie is the username
    changeUser();
} else {
    username = document.cookie.split(';')[0]; // for data from Classic Mode
}

console.log(document.cookie)
console.log(`Username: `+username); // log for debug

updateChapterOptions(); // so that you can select a chapter without having to select James first