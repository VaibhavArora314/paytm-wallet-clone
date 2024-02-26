const { Router } = require("express");
const { authMiddleware } = require("../middleware");
const { Account, User, Transaction } = require("../db");
const zod = require("zod");
const mongoose = require("mongoose");

const accountRouter = Router();

accountRouter.get('/balance', authMiddleware, async (req,res) => {
    const account = await Account.findOne({userId: req.userId});

    res.status(200).json({
        balance: account.balance
    })
})

accountRouter.get('/history', authMiddleware, async (req,res) => {
    const account = await Account.findOne({userId: req.userId}).populate({
        path: 'history',
        model: 'Transaction',
        populate: [{
            path: 'sender',
            model: 'User',
        }, {
            path: 'receiver',
            model: 'User'
        }]
    });

    res.status(200).json({
        history: account.history.map(transaction => ({
            _id: transaction._id,
            sender: {
                _id: transaction.sender._id,
                username: transaction.sender.username,
                firstName: transaction.sender.firstName,
                lastName: transaction.sender.lastName,
            },
            receiver: {
                _id: transaction.receiver._id,
                username: transaction.receiver.username,
                firstName: transaction.receiver.firstName,
                lastName: transaction.receiver.lastName,
            },
            transferAmount: transaction.transferAmount,
            date: transaction.date,
            type: (transaction.sender._id == req.userId ? "Debit" : "Credit"),
        }))
    })
})

accountRouter.get('/history/:id', authMiddleware, async (req,res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid transaction id"
            })
        }

        const transaction = await Transaction.findOne({_id: req.params.id}).populate([{
            path: 'sender',
            model: 'User',
        }, {
            path: 'receiver',
            model: 'User'
        }]);
    
        if (!transaction) {
            return res.status(400).json({
                message: "No such transaction exists or transaction may have failed"
            })
        }
    
        if (transaction.sender._id != req.userId && transaction.receiver._id != req.userId) {
            return res.status(403).json({
                message: "You do not have access to view this!",
            })
        }
    
        res.status(200).json({
            transaction: {
                _id: transaction._id,
                sender: {
                    _id: transaction.sender._id,
                    username: transaction.sender.username,
                    firstName: transaction.sender.firstName,
                    lastName: transaction.sender.lastName,
                },
                receiver: {
                    _id: transaction.receiver._id,
                    username: transaction.receiver.username,
                    firstName: transaction.receiver.firstName,
                    lastName: transaction.receiver.lastName,
                },
                transferAmount: transaction.transferAmount,
                date: transaction.date
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "An unexpected error occurred while fetching transaction details",
            error
        })
    }
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

    let transaction = null;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const senderAccount = await Account.findOne({ userId: userId }).session(session);

        if (!senderAccount || senderAccount.balance < amount) {
            await session.abortTransaction();
            await session.endSession();

            return res.status(400).json({
                message: "Insufficient Balance"
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

        transaction = await Transaction.create({
            sender: userId,
            receiver: to,
            transferAmount: amount,
            date: Date.now()
        });

        await Account.findOneAndUpdate(
            { userId: userId },
            { 
                $inc: { balance: -amount } ,
                $push: { history: transaction._id }
            },
            { session }
        );

        await Account.findOneAndUpdate(
            { userId: to },
            {
                $inc: { balance: amount },
                $push: { history: transaction._id }
            },
            { session }
        );

        await session.commitTransaction();

        res.status(200).json({
            message: "Transfer Successful",
            transactionId: transaction._id,
        });
    } catch (error) {
        await session.abortTransaction();

        if (transaction) {
            // in case transfer fails after creation of transaction object
            await Transaction.deleteOne({ _id: transaction._id });
        }

        console.log(error);

        res.status(500).json({
            message: "Transfer Failed",
        });
    } finally {
        await session.endSession();
    }
});

module.exports = accountRouter;