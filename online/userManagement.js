
function registerNew(user) {
    console.log(`Submitting to https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/users with data: ${user}`);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/users`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        registeredUsers: users.concat([user])
    })); 
}

async function fetchUsers() { // IMPORTANT: will return promise, must manage data outside of function with .then()
    console.log(`Fetching from https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/users`); // format: .then (data => console.log(data))
    const url = `https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/users`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store' // to make sure it is the latest data
        });
        if (!response.ok) {
            return {registeredUsers:[]}; // return an empty database
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // IMPORTANT: will return json, must use data.registeredUsers to get the array
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}