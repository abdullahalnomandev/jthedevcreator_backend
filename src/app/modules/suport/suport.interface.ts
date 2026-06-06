import { Types } from "mongoose";


export interface suportData {
    title: string,
    description: string,
    image: string,
    user: Types.ObjectId
}