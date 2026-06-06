import { model, Schema } from "mongoose";
import { ITopTasks } from "./topTast.interface";


const topTasksSchema = new Schema<ITopTasks>({
    background: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    keyword: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

export const TopTasks = model<ITopTasks>("topTask", topTasksSchema);
