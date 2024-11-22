const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  received: {
    type: Boolean,
    default: false,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSessionSchema = new mongoose.Schema({
  senderUserName: {
    type: String,
    required: true,
  }, // The user this chat is with
  messages: [MessageSchema], // Array of messages in this chat session
});

// Schema for a user's chats

const UserChatsSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  chats: [ChatSessionSchema], // Array of chat sessions
});

const UserChats = mongoose.model("UserChats", UserChatsSchema);

module.exports = UserChats;
