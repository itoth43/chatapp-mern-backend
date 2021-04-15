import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    message: String,
    chatName: String,
    name: String,
    timestamp: String,
    received: Boolean,
}); 

export default mongoose.model("messagecontents", whatsappSchema);