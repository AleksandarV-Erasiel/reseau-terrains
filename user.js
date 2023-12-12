let users = {};

class User {
    constructor(username, password, isAdmin) {
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
        this.active = false;
    }

    setActiveState(b) {
        this.active = b;
    }
}

module.exports = {
    addUser: (data) => {
        const { username, password, isAdmin } = data;
        const user = new User(username, password, isAdmin);
        users[username] = user;
        return user;
    },

    getUser: (name) => {
        for (const user of Object.values(users)) {
            if (user.name === name) {
                return user;
            }
        }
        return null;
    },

    getUsers: () => {
        return Object.values(users);
    },
}