const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../data/dev.sqlite')
});

const User = sequelize.define('User', {
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING }
}, { tableName: 'users', timestamps: false });

async function check() {
    const users = await User.findAll();
    console.log("ALL USERS:");
    users.forEach(u => console.log(u.email, u.password.substring(0, 10) + '...', u.role));
}

check().catch(console.error);
