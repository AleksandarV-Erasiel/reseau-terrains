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

        socket.on('wrong-password', () => {
            window.location.href = '/wrong_password.html';
        });
    }

    const changePasswordBtn = document.getElementById("pwdModifierButton");
    if (changePasswordBtn) {
        const urlParams = new URLSearchParams(window.location.search);
        const usernameParam = urlParams.get("username");
        const oldPasswordParam = urlParams.get("old-password");
        const newPasswordParam = urlParams.get("new-password");
        const confirmedNewPasswordParam = urlParams.get("confirmed-new-password");

        if (newPasswordParam != confirmedNewPasswordParam)
            window.location.href = '/passwords_different.html';
        else if (usernameParam && oldPasswordParam && newPasswordParam && confirmedNewPasswordParam) {
            document.getElementById('username').value = usernameParam;
            document.getElementById('old-password').value = oldPasswordParam;
            document.getElementById('new-password').value = newPasswordParam;
            document.getElementById('confirmed-new-password').value = confirmedNewPasswordParam;
        }

        changePasswordBtn.addEventListener('click', () => {
            const username = document.getElementById('username').value;
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            console.log(username + " " + oldPassword + " " + newPassword);
            socket.emit('change-user-pwd', { username: username, oldPassword: oldPassword, newPassword: newPassword });
        })
    }

    // Handle password changed event
    socket.on('password-changed', (data) => {
        if (data.success) {
            console.log('Password changed successfully.');
            // Add any additional logic you want to perform after a successful password change
        } else {
            console.log('Failed to change password.');
            // Add any additional logic you want to perform after a failed password change
        }
    });
});
