import { model, Schema, Types } from "mongoose"


export interface IRating  {
    star: number,
    comment: string,
    from: string,
    asAProvider: boolean
    for: Types.ObjectId
}

const ratingSchema = new Schema<IRating>({
    star:{
        type: Number,
        default: 0
    },
    comment: {
        type: String,
        default: ""
    },
    from: {
        type: String,
        default: "Unknowng"
    },
    for:{
        type: Schema.Types.ObjectId,
        ref:"user"
    },
    asAProvider:{
        type: Boolean,
        required: true
    }
},{timestamps:true})

export const Reating = model<IRating>("reating",ratingSchema);