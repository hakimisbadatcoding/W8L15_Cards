const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = process.env.PORT || 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
}

const app = express();
app.use(express.json());

const pool = mysql.createPool(dbConfig);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/allcards', async (req, res) => {
    let connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT * FROM cards');
        res.json(rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'Server error for allcards'});
    } finally {
        connection.release();
    }
});

app.post('/addcard', async (req, res) => {
    const { card_name, card_pic } = req.body;
    let connection = await pool.getConnection();
    try {
        await connection.execute('INSERT INTO cards (card_name, card_pic) VALUES (?, ?)', [card_name, card_pic]);
        res.status(201).json({ message: 'Card ' + card_name + ' added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add card ' + card_name });
    } finally {
        connection.release();
    }
});

