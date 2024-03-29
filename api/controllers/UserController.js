var md5 = require('md5');
const db = require("../models");
const User = db.user;
const UserMeta = db.userMeta
var jwt = require("jsonwebtoken");


exports.create = async (req, res) => {
   // console.log(req)

    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    try{
        var verificationCode = Math.floor(100000 + Math.random() * 900000);
    const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        //mobile_number: req.body.mobile_number,
        //email_id: req.body.email_id,
        user_name: req.body.user_name,
        password: md5(req.body.password),
        verification_code: md5(verificationCode)
    };
        const userData =  await User.create(user)
        const userMeta = {
                        mobile_number: req.body.mobile_number,
                        email_id: req.body.email_id,
                    }
        const userMetaData = await UserMeta.create(userMeta)
        var token = jwt.sign({ id: userData.id }, 'releife_app', {
                            expiresIn: 86400 // 24 hours
                        });
                        userData.verification_code = verificationCode;
                        delete userData.password;
                        var data = {
                            status: true,
                            token: token,
                            userData: Object.assign(userMeta,user)
                        }
                        res.send(data)
    }catch(error){
        console.log(error)
        res.status(500).send({
                        status: false,
                       // message: err.message || "Some error occurred while creating the Tutorial."
        });
    }
    // User.create(user)
    //     .then(data => {
    //         const userMeta = {
    //             mobile_number: req.body.mobile_number,
    //             email_id: req.body.email_id,
    //         }
    //         UserMeta.create(userMeta).then(data1 =>{
    //             var token = jwt.sign({ id: data.id }, 'releife_app', {
    //                 expiresIn: 86400 // 24 hours
    //             });
    //             console.log(data)
    //             data.verification_code = verificationCode;
    //             delete data.password;
    //             var data = {
    //                 status: true,
    //                 token: token,
    //                 userData: data,data1
    //             }
    //             res.send(data);
    //         })
    //         })
            
    //     .catch(err => {
    //         res.status(500).send({
    //             status: false,
    //             message: err.message || "Some error occurred while creating the Tutorial."
    //         });
    //     }); 
};

exports.login = (req, res) => {
    var password = md5(req.body.password)
    User.findAll({ where: { user_name: req.body.user_name, password: password } })
        .then(data => {
            if (data.length != 0) {
                var token = jwt.sign({ id: data.id }, 'releife_app', {
                    expiresIn: 86400 // 24 hours
                });
                delete data[0].password;
                delete data[0].verification_code;
                var dataObject = {
                    status: true,
                    token: token,
                    userData: data[0]
                }
                res.send(dataObject);
            } else {
                res.status(400).send({
                    status: false,
                    message: "Email or Password not Match!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
}

exports.getUser = (req, res) => {

    User.findAll({ where: { id: req.userId, } })
        .then(data => {
            if (data.length != 0) {
                delete data[0].password;
                delete data[0].verification_code;
                res.send(data[0]);
            } else {
                res.status(400).send({
                    status: false,
                    message: "User not found!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                status: false,
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};

exports.verifyOtp = (req, res) => {

    var verification_code = md5(parseFloat(req.body.verification_code))

    User.update({ status: 'active' }, {
        where: { id: req.userId, verification_code: verification_code }
    }).then(num => {
        if (num == 1) {
            res.send({
                "success": true,
                "message": "code verify successfully."
            });
        } else {
            res.send({
                "success": false,
                "message": "Incorrect code."
            });
        }
    }).catch(err => {
        res.status(500).send({
            message: "Error updating Tutorial with id=" + id
        });
    });
};