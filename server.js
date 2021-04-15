// importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Chats from './dbChats.js';
import Pusher from 'pusher';
import cors from 'cors';

// app config
const app = express();
const port = process.env.PORT || 9000;

/// used to push from backend to frontend
const pusher = new Pusher({
    appId: "1174172",
    key: "98e9b0f3e4100a393b03",
    secret: "8505536598aa7761567e",
    cluster: "us2",
    useTLS: true
  });

// middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    /// determines which origins are allowed to access server resources over CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

// DB config
const connection_url = 'mongodb+srv://admin:1cqBo283sg05bTfq@cluster0.wt7cy.mongodb.net/whatsappdb?retryWrites=true&w=majority';

mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.once("open", () => {
    console.log("DB is connected");

    const msgCollection = db.collection("messagecontents");
    const chatCollection = db.collection("chatcontents");

    const messageChangeStream = msgCollection.watch();
    const chatChangeStream = chatCollection.watch();

    messageChangeStream.on("change", (change) => {
        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                name: messageDetails.name,
                chatName: messageDetails.chatName,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });
        } else {
            console.log("Error triggering message Pusher");
        }
    });

    chatChangeStream.on("change", (change) => {
        if (change.operationType === "insert") {
            const chatDetails = change.fullDocument;
            pusher.trigger("chats", "inserted", {
                name: chatDetails.name,
                user: chatDetails.users,
                recipient: chatDetails.recipient,
            });
        } else {
            console.log("Error triggering chat Pusher");
        }
    });
});

// api routes
app.get("/",(req, res)=>res.status(200).send('Chat App Server Successfully Started.'));

app.get("/messages/sync", (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})

app.post("/messages/new", (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
})

app.get("/chats/sync", (req, res) => {
    Chats.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})

app.post("/chats/new", (req, res) => {
    const dbChats = req.body;

    Chats.create(dbChats, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    })
})

// listener
app.listen(port, ()=>console.log(`Listening on localhost:${port}`));