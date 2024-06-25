const express=require("express")

const router=express.Router()


const User=require("../modal/user.model")
const Chat=require("../modal/chat.model")
const Message=require("../modal/message.model")

const {protect}=require("../middleware.js/authMiddleware")

router.route("/")
    .post(protect,async(req,res)=>{
        const { content, chatId } = req.body;

        if (!content || !chatId) {
            console.log("Invalid data passed into request");
            return res.sendStatus(400);
        }

        var newMessage = {
            sender: req.user._id,
            content: content,
            chat: chatId,
        };

        try {
            var message = await Message.create(newMessage);

            message = await message.populate("sender", "name pic");
            message = await message.populate("chat");
            message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
            });

            await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

            res.json(message);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }

    })

router.route("/:chatId")
    .get(protect,async(req,res)=>{
        try {
            const messages = await Message.find({ chat: req.params.chatId })
              .populate("sender", "name pic email")
              .populate("chat");
            res.json(messages);
          } catch (error) {
            res.status(400);
            throw new Error(error.message);
          }
    })

module.exports=router