import mongoose from "mongoose";


const schema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    } 
});

export const Faq = mongoose.model("Faq", schema);
