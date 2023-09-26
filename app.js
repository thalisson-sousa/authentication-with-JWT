// Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Config JSON Response
app.use(express.json());

// Models
const User = require('./models/User');

// Open Route - Public Route
app.get('/', (req, res) => {
    return res.status(200).json({msg: "Bem vindo a nossa API!"});
})

// Private Route
app.get('/user/:id', checkToken, async(req, res) => {
    const id = req.params.id;

    // Checar se usuario existe
    const user = await User.findById(id, '-password');

    if(!user) {
        return res.status(404).json({ msg: "Usuario não encontrado" });
    }

    res.status(200).json({ user });

})

function checkToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) {
        return res.status(401).json({ msg: "Acesso Negado!" });
    }

    try {

        const secret = process.env.SECRET;

        jwt.verify(token, secret);

        next();
        
    } catch (error) {
        res.status(400).json({ msg: "Token inválido!" });
        console.log(error);
    }
}

// Registrar Usuario
app.post('/auth/register', async(req, res) => {

    const { name, email, password, confirmpassword } = req.body;

    // validações
    if(!name) {
        return res.status(422).json({msg: "O nome é Obrigatorio"});
    }

    if(!email) {
        return res.status(422).json({msg: "O email é Obrigatorio"});
    }

    if(!password) {
        return res.status(422).json({msg: "O password é Obrigatorio"});
    }

    if(password !== confirmpassword) {
        return res.status(422).json({msg: "As senhas não conferem!"});
    }

    // Verificar se usuario existe
    const userExist = await User.findOne({ email: email });

    if (userExist) {
        return res.status(442).json({msg: "por favor, utilize outro e-mail"});
    } else {
        // Criar senha
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
    
        // Criar Usuario
        const user = new User({
            name,
            email,
            password: passwordHash,
        })
    
        try {
            await user.save();
            res.status(201).json({ msg: "Usuario Criado com sucesso!" });
        } catch (error) {
            res.status(500).json({ msg: "Houve um erro no servidor, tente novamente mais tarde!" });
            console.log(error);
        }
    }

});

// Login User
app.post('/auth/login', async(req, res) => {
    const { email, password } = req.body;

    // validações
    if(!email) {
        return res.status(422).json({msg: "O email é Obrigatorio"});
    } 
    
    if(!password) {
        return res.status(422).json({msg: "O password é Obrigatorio"});
    }

    // Verificar se usuario existe
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(404).json({msg: "Usuario, não encontrado"});
    }

    // verificar se a password está correta
    const checkPassword = await bcrypt.compare(password, user.password);

    if(!checkPassword) {
        return res.status(422).json({msg: "Senha invalida"});
    }

    try {
        const secret = process.env.SECRET;

        const token = jwt.sign({
            id: user._id,
        },
        secret,
        );

        res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });

    } catch (error) {
        res.status(503).json({ msg: "Houve um erro no servidor, tente novamente mais tarde!" });
        console.log(error);
    }
})

// Credenciais
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;

// Conexão com o Banco
mongoose.connect(`mongodb+srv://${dbuser}:${dbpassword}@cluster0.qv0zx7r.mongodb.net/?retryWrites=true&w=majority`).then(() =>{
    app.listen(3000);
    console.log("Conectou ao Banco");
}).catch((err) => console.log(err));

