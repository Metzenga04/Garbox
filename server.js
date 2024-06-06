const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');

const app = express();
const port = 3000;

const corsOptions = {
    origin: 'http://127.0.0.1:5500',
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'seuSegredoAqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  
}));

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'web_site'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados.');
});

const saltRounds = 10;

app.post('/register', (req, res) => {
    const { nome, apelido, morada, email, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Erro ao hash a senha.');
        }

        const sql = 'INSERT INTO users (nome, apelido, email, password, morada) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [nome, apelido, email, hashedPassword, morada], (err, result) => {
            if (err) {
                return res.status(500).send('Erro ao registrar o usuário.');
            }
            res.status(200).send('Usuário registrado com sucesso!');
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT id, password FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).send('Erro ao buscar o usuário.');
        }

        if (results.length === 0) {
            return res.status(400).send('Usuário não encontrado.');
        }

        const user = results[0];
        const hashedPassword = user.password;
        bcrypt.compare(password, hashedPassword, (err, match) => {
            if (err) {
                return res.status(500).send('Erro ao verificar a senha.');
            }

            if (!match) {
                return res.status(401).send('Credenciais inválidas.');
            }
            req.session.user = user;

            res.json({ success: true, userId: user.id });
        });
    });
});

app.get('/boxes/location1', (req, res) => {
    const sql = 'SELECT * FROM boxes WHERE location_id = ?';
    db.query(sql, [1], (err, results) => {
        if (err) {
            return res.status(500).send('Erro ao buscar as boxes.');
        }
        res.json(results);
    });
});

app.get('/boxes/location2', (req, res) => {
    const sql = 'SELECT * FROM boxes WHERE location_id = ?';
    db.query(sql, [2], (err, results) => {
        if (err) {
            return res.status(500).send('Erro ao buscar as boxes.');
        }
        res.json(results);
    });
});

app.get('/boxes/location3', (req, res) => {
    const sql = 'SELECT * FROM boxes WHERE location_id = ?';
    db.query(sql, [3], (err, results) => {
        if (err) {
            return res.status(500).send('Erro ao buscar as boxes.');
        }
        res.json(results);
    });
});

app.post('/api/reservas', (req, res) => {
    const { boxId, start, details } = req.body;
    const user = req.session.user;

    if (!user) {
        return res.status(401).send('Acesso não autorizado. Faça login para continuar.');
    }

    const sql = 'INSERT INTO reservations (box_id, start_time, details, user_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [boxId, start, details, user.id], (err, result) => {
        if (err) {
            console.error('Erro ao criar a reserva:', err);
            return res.status(500).send('Erro ao criar a reserva.');
        }
        res.json({ success: true });
    });
});


function getUserIdFromCookie(req) {
    const cookie = req.headers.cookie;
    if (!cookie) {
        console.log('Nenhum cookie encontrado');
        return null;
    }

    console.log('Cookies recebidos:', cookie);

    const cookieArray = cookie.split(';');
    for (const cookieItem of cookieArray) {
        const [name, value] = cookieItem.trim().split('=');
        if (name === 'userId') {
            console.log('userId encontrado:', value);
            return value;
        }
    }
    console.log('Cookie userId não encontrado');
    return null;
}

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});