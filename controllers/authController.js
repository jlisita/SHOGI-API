// authController.js

const { User, UserStat } = require("../db/sequelizeSetup")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require("../configs/privatekey");
const { generateToken } = require('../utils/auth.js');

const login = async (req, res, next) => {
    try {
        // Validation des entrées
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await User.scope('withPassword').findOne({ where: { username: req.body.username } });
        if (user === null) {
            return res.status(404).json({ message: "Invalid Credentials" });
        }

        const isCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Génération du token JWT
        const token = generateToken(user);
        res.status(200).json({ message: 'Connexion réussie', token });
        
    } catch (error) {
        next(error); 
    }
};
    
const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.access_token 

        if (!token) {
            return res.status(200).json({ isLoggedIn: false });
        }
        
        const decoded = jwt.verify(token, SECRET_KEY); 
        const userId = decoded.userId; 

        const user = await User.findByPk(userId);
        if (!user) {
            console.log("pas d'utilisateur")
            return res.status(200).json({ isLoggedIn: false });
        }

        return res.status(200).json({ message: "authentification réussie" ,isLoggedIn: true })
    
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        console.log("autre erreur")
        return res.status(200).json({ isLoggedIn: false });
    }
};

const logout = (req, res) => {
     // supprimer le token du storage dans le front:
    // - localStorage pour React Web
    // - AsyncStorage pour React Native

    // Réponse de succès pour la déconnexion
    return res.status(200).json({ message: 'Déconnexion réussie' });
}

const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
    
        if (!username || username.length < 3) {
        return res.status(400).json({ message: "Le nom d'utilisateur doit contenir au moins 3 caractères." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Adresse email invalide." });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
        });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }
    
        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Création de l'utilisateur
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            roleId: 1,
        });

        // Créer automatiquement un userStat 
        await UserStat.create({ wins:0, losses:0, draws:0, score:0, UserId: newUser.id });
        const token = generateToken(newUser);
        return res.status(201).json({ message: 'Utilisateur créé avec succès.', token, newUser });
        } catch (error) {
        return res.status(500).json({ message: "Erreur lors de l'inscription." });
        }
    };

  const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Ancien et nouveau mot de passe requis." });
        }

        const user = await User.scope('withPassword').findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Vérification de l'ancien mot de passe
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Ancien mot de passe incorrect." });
        }

        // Hash du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Mot de passe mis à jour avec succès." });

    } catch (error) {
        console.error("Erreur changement de mot de passe :", error);
        return res.status(500).json({ message: "Erreur serveur." });
    }
};

module.exports = { login, logout, checkAuth, signup, changePassword }
