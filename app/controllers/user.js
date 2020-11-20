'use strict';
module.exports = (db) => {
    const User = db.User;
    const AuthToken = db.AuthToken;
    const crypto = require('crypto');
    const Tools = require('../utils/Tools');

    return {
        register: async (req, res) => {
            try {
                const pass = req.body.password
                const email = req.body.email

                if (!email || !pass) {
                    return res.status(400).send(
                        'Email ou mot de passe vide'
                    );
                }else{

                    let userSearch = await User.findOne({
                        where: {
                            email: email
                        }
                    });

                    if (userSearch) {
                        return res.status(400).send("Cet email existe déjà");
                    }

                    const pass = req.body.password
                    const hash = crypto.createHash("sha256")
                    const passHash = hash.update(pass).digest("hex")

                    let user = await User.create({
                        id: Tools.uuid(),
                        email: email,
                        password:passHash
                    });
                    return res.status(200).send(user);
                }
            } catch (err) {
                return res.status(500).send(err);
            }
        },
        login: async (req, res) => {
            const {email, password} = req.body;

            const hash = crypto.createHash("sha256")
            const passHash = hash.update(password).digest("hex")

            const getUser = async email => {
                return await User.findOne({
                    where: email,
                })
            }
            if (!email || !password) {
                return res.status(400).send(
                    'Email ou mot de passe vide'
                );
            } else {
                let user = await getUser({email})
                if (!user) {
                    return res.status(401).send('aucun utilisateur trouver');
                }
                if (user.password === passHash) {

                    const getInfoUser = await User.findOne({
                        where: {id: user.id},
                        attributes: ["id", "email"]
                    });

                    const mytoken = await AuthToken.findOne({where: {userId: user.id}});

                    if (mytoken) {
                        res.status(401).send("déja connecté")
                    } else {
                        let token = crypto.randomBytes(64).toString('hex');
                        await AuthToken.create({
                            id: Tools.uuid(),
                            userId: getInfoUser.id,
                            token: token,
                            //update_at: new Date('+1day')

                        });
                        return res.status(200).send({getInfoUser, token})
                    }
                }
                else {
                    return res.status(401).send('Mot de passe incorrect');
                }
            }
        },
        logout: async (req, res) => {
            const { id } = await req.body

            const getUser = async id => {
                return await User.findOne({
                    where: id,
                })
            }
            let user = await getUser({id})
            if (!user) {
                return res.status(401).send('aucun utilisateur trouver');
            }
            const tokenUser = await AuthToken.findOne({where: {userId: user.id}});
            if (tokenUser){
                await tokenUser.updated_at('NOW')
                res.status(200).send('Utilisateur déconnecté')
            }else{
                res.status(401).send('utilisateur non connecté')
            }
            res.status(404).send('Not found')
        },
        allUser: async (req, res) => {
            try {
                const users = await User.findAll();
                return res.status(200).json(users);
            } catch (error) {
                return res.status(500).send(error.message);
            }
        }

    }
};
