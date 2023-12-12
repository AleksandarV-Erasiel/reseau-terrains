$(function () {
    let socket = io();

    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
        const urlParams = new URLSearchParams(window.location.search);
        const usernameParam = urlParams.get("username");
        const passwordParam = urlParams.get("password");

        console.log(usernameParam);
        
        if (usernameParam && passwordParam) {
            document.getElementById('username').value = usernameParam;
            document.getElementById('password').value = passwordParam;
        }
        
        loginButton.addEventListener('click', () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            console.log(username + " " + password);
            socket.emit('verify-user-data', { username: username, password: password });
        })

        socket.on('correct-user-data', () => {
            console.log("received redirection");
            window.location.href = '/dashboard.html';
        });

        socket.on('wrong-user-data', () => {
            window.location.href = '/unknown.html';
        });
    }
});