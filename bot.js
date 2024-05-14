const mysql = require('mysql');
const Discord = require('discord.js');
const client = new Discord.Client({ 
    intents: [
        Discord.Intents.FLAGS.GUILDS, 
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ] 
});

const connection = mysql.createConnection({
    host: 'm17nl36j.infinityfree.com',
    user: 'if0_35859794',
    password: '0556197126',
    database: 'if0_35859794_piewart'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

client.on('message', async message => {
    if (message.author.bot) return;
    
    const args = message.content.split(" ");
    const command = args.shift().toLowerCase();

    if (command === '!radios') {
        connection.query(`SELECT balance FROM currency WHERE userId = '${message.author.id}'`, (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            const balance = rows.length > 0 ? rows[0].balance : 0;
            message.channel.send(`Your balance is ${balance}`);
        });
    }

    if (command === '!week') {
        connection.query(`SELECT balance FROM currency WHERE userId = '${message.author.id}'`, (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            const newBalance = (rows.length > 0 ? rows[0].balance : 0) + 30000;
            connection.query(`INSERT INTO currency (userId, balance) VALUES ('${message.author.id}', ${newBalance}) ON DUPLICATE KEY UPDATE balance = ${newBalance}`, (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                message.channel.send('You received your weekly salary of 30,000.');
            });
        });
    }

    if (command === '!giveto') {
        const recipient = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!recipient || isNaN(amount)) {
            message.channel.send('Invalid command usage. Correct usage: !giveto @user amount');
            return;
        }

        connection.query(`SELECT balance FROM currency WHERE userId = '${message.author.id}'`, (err, senderRows) => {
            if (err) {
                console.error(err);
                return;
            }
            const senderBalance = senderRows.length > 0 ? senderRows[0].balance : 0;
            if (senderBalance < amount) {
                message.channel.send("You don't have enough currency to make this transfer.");
                return;
            }

            connection.query(`SELECT balance FROM currency WHERE userId = '${recipient.id}'`, (err, recipientRows) => {
                if (err) {
                    console.error(err);
                    return;
                }
                const recipientBalance = recipientRows.length > 0 ? recipientRows[0].balance : 0;
                const newSenderBalance = senderBalance - amount;
                const newRecipientBalance = recipientBalance + amount;
                connection.query(`UPDATE currency SET balance = ${newSenderBalance} WHERE userId = '${message.author.id}'`);
                connection.query(`UPDATE currency SET balance = ${newRecipientBalance} WHERE userId = '${recipient.id}'`);
                message.channel.send(`Successfully transferred ${amount} to ${recipient.username}.`);
            });
        });
    }
});

client.login('');
