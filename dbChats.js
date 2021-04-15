import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    name: String,
    user: String,
    recipient: String,
}); 

export default mongoose.model("chatcontents", whatsappSchema);