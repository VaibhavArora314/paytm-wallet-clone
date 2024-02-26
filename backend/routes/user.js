const { Router } = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User, createHash, validatePassword, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const userRouter = Router();

const signUpBody = zod.object({
    username: zod.string().email().max(30),
    firstName: zod.string().min(1).max(30),
    lastName: zod.string().min(1).max(30),
    password: zod.string().min(8).max(30)
});

userRouter.post("/signup",async (req,res) => {
    const body = req.body;
    const {success} = signUpBody.safeParse(body);

    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs",
        });
    }

    const existingUser = await User.findOne({
        username: body.username
    });

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs",
        });
    }

    const passwordHash = await createHash(body.password);

    const user = await User.create({
        username: body.username,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName
    });
    
    await Account.create({
        userId: user._id,
        balance: 100 + Math.floor(Math.random()*9900) // random initial balance b/w 100 and 10000
    })

    const jwtToken = jwt.sign({
        userId: user._id
    }, JWT_SECRET);

    res.status(200).json({
        message: "User created successfully",
        token: jwtToken
    })
});

const signInBody = zod.object({
    username: zod.string().email().max(30),
    password: zod.string().min(8).max(30)
})

userRouter.post('/signin' , async (req,res) => {
    const body = req.body;

    const {success} = signInBody.safeParse(body);
    if (!success) {
        return res.status(411).json({
            message: "Error while logging in",
        });
    }

    const user = await User.findOne({
        username: body.username
    });

    if (user) {
        const passwordValidated = await validatePassword(body.password, user.passwordHash);
        if (passwordValidated) {
            const jwtToken = jwt.sign({
                userId: user._id
            }, JWT_SECRET);
            
            return res.status(200).json({
                token: jwtToken
            });
        } 
    }

    res.status(411).json({
        message: "Error while logging in",
    });
})

const updateUserBody = zod.object({
    firstName: zod.string().max(30).optional(),
    lastName: zod.string().max(30).optional(),
    password: zod.union([zod.string().min(8).max(30),zod.string().length(0)]).optional()
})

userRouter.put('/', authMiddleware, async (req,res) => {
    const userId = req.userId;
    const body = req.body;

    const {success} = updateUserBody.safeParse(body);

    if (!success) {
        return res.status(411).json({
            message: "Error while updating information"
        })
    }

    const user = await User.findOne({_id: userId});

    if (body.password) {
        const newPasswordHash = await createHash(body.password);
        user.passwordHash = newPasswordHash;
    }
    if (body.firstName)
        user.firstName = body.firstName;
    if (body.lastName)
        user.lastName = body.lastName;

    await user.save();

    res.status(200).json({
        message: "Updated successfully"
    })
})

userRouter.get('/bulk', authMiddleware, async (req,res) => {
    const userId = req.userId;
    const filter = req.query.filter || "";
    // const page = req.query.page || 1;
    // const limit = req.query.limit || 2;

    const users = await User.find({
        _id: { $ne: userId},
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.status(200).json({
        users: users.map((user) => ({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        })),
        // currentPage: page,
        // totalPages: count,
    })
})

userRouter.get('/me', authMiddleware, async (req,res) => {
    const userId = req.userId;

    const user = await User.findOne({_id:userId});

    if (user && user._id) 
        return res.status(200).json({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    
    res.status(404).json({
        message: "No such user!",
    })
})

module.exports = userRouter;