const { Router } = require("express");
const { authMiddleware } = require("../middleware");
const { Account, User } = require("../db");
const zod = require("zod");
const mongoose = require("mongoose");

const accountRouter = Router();

accountRouter.get('/balance', authMiddleware, async (req,res) => {
    const account = await Account.findOne({userId: req.userId});

    res.status(200).json({
        balance: account.balance
    })
})

const transferBody = zod.object({
    to: zod.string(),
    amount: zod.coerce.number().min(1),
})

accountRouter.post('/transfer', authMiddleware, async (req, res) => {
    const { to, amount } = req.body;
    const userId = req.userId;

    const { success } = transferBody.safeParse({ to, amount });

    if (!success || userId == to) {
        return res.status(400).json({
            message: "Invalid data"
        });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const senderAccount = await Account.findOne({ userId: userId }).session(session);

        if (!senderAccount || senderAccount.balance < amount) {
            await session.abortTransaction();
            await session.endSession();

            return res.status(400).json({
                message: !senderAccount ? "No Such User" : "Insufficient Balance"
            });
        }

        const targetUser = await User.findOne({ _id: to }).session(session);

        if (!targetUser) {
            await session.abortTransaction();
            await session.endSession();

            return res.status(400).json({
                message: "Invalid Account"
            });
        }

        await Account.findOneAndUpdate(
            { userId: userId },
            { $inc: { balance: -amount } },
            { session }
        );

        await Account.findOneAndUpdate(
            { userId: to },
            { $inc: { balance: amount } },
            { session }
        );

        await session.commitTransaction();

        res.status(200).json({
            message: "Transfer Successful"
        });
    } catch (error) {
        await session.abortTransaction();

        console.log(error);

        res.status(500).json({
            message: "Transfer Failed"
        });
    } finally {
        await session.endSession();
    }
});

module.exports = accountRouter;