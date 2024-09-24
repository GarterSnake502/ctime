
async function registerNew(user) {
    const url = `https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/users`;
    const data = {"registeredUsers": users.concat([user])};
    console.log(`Submitting to https://kvdb.io/U6KfLHiFT1VQ7HA3UK1v7W/users with data: ${user}`);
    console.log(data);
    
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
        fetchUsers(); // update the active users array--will automatically update users

    } catch (error) {
        alert('Error submitting data:', error);
    }
}


async function fetchUsers() { // IMPORTANT: updates users rather than returning them as of September 24
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
        users = data.registeredUsers; // update the active users array--do NOT do this when calling the function!!!
        displayHighScores();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}