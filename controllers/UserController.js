import {validationResult} from "express-validator";
import UserModel from '../models/User.js'
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
    try {
        const errs = validationResult(req);
        if (!errs.isEmpty()) {
            return res.status(400).json(errs.array());
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        console.log(req.body.fullName)
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash:hash
        });
        const user = await doc.save();
        const token = jwt.sign({
            _id:user._id
        },'secret123',{
            expiresIn: "30d"
        })
        const {passwordHash ,...userData} = user._doc
        res.json(
        {
            ...userData,
            token
        }
        );
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'не вдалось зарееструвати'
        })
    }
}
export const login = async (req,res) => {
    try {
        const user = await UserModel.findOne({email:req.body.email})
        if(!user) {
            return res.status(404).json({
                message : 'Користувач не знайден'
            })
        }
        const isValidPass = await bcrypt.compare(req.body.password,user._doc.passwordHash)
        if(!isValidPass) {
            return res.status(400).json({
                message : 'Логін або пароль введений невірно'
            })
        }
        const token = jwt.sign({
            _id:user._id
        },'secret123',{
            expiresIn: "30d"
        })
        const {passwordHash ,...userData} = user._doc
        res.json(
        {
            ...userData,
            token
        }
        );
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message:'не вдалось авторизуватись'
        })
    }
}
export const getMe = async(req,res)=> {
    try {
        const user = await UserModel.findById(req.userId)
        if(!user) {
            return res.status(404).json({
                message : 'Користувач не знайдений'
            })
        }
        const {passwordHash ,...userData} = user._doc
        res.json(userData)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'не вдалось зарееструвати'
        })
    }
}