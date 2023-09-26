// Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jet = require('jsonwebtoken');

const app = express();

// Config JSON Response
app.use(express.json());

// Open Route - Public Route
app.get('/', (req, res) => {
    res.status(200).json({msg: "Bem vindo a nossa API!"})
})

// Registrar Usuario
app.post('/auth/register', async(req, res) => {

    const { name, email, password, confirmpassword } = req.body;

    // validações
    if(!name) {
        res.status(202).json({msg: "O nome é Obrigatorio"})
    }
});

// Credenciais
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;

// Conexão com o Banco
mongoose.connect(`mongodb+srv://${dbuser}:${dbpassword}@cluster0.qv0zx7r.mongodb.net/?retryWrites=true&w=majority`).then(() =>{
    app.listen(3000);
    console.log("Conectou ao Banco");
}).catch((err) => console.log(err));

