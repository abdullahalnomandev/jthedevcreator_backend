import { model, Schema } from "mongoose";
import { policie } from "./policie.interface";
import { policie_type } from "../../../enums/policie";


const policieSchema = new Schema<policie>({
    context: {
        type: String,
        default: "",
        unique: true,
        min: 20
    },
    type: {
        type: String,
        enum: policie_type,
        unique: true
    }
},{
    timestamps: true
})

export const Policie = model<policie>("policie",policieSchema)