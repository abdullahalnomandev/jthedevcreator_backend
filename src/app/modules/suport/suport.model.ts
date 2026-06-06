import { model, Schema } from "mongoose";
import { suportData } from "./suport.interface";


const suportSchema = new Schema<suportData>({
    title: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"  
    },
    description:{
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

export const Suport = model<suportData>("suport", suportSchema);