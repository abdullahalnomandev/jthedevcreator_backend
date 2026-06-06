import { Types } from "mongoose"

export type postInterface = {
    createdBy: Types.ObjectId,
    skipFrom: Types.ObjectId[],
    title: string,
    description: string,
    amount: number,
    work_time: Date,
    deadline: Date,
    images: string[],
    address: string
    location: {
            type: string,
            coordinates: number[]
        } ,
    lat: number,
    lng: number
}