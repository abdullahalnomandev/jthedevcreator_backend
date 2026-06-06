import { model, Schema } from "mongoose";
import { postInterface } from "./post.interface";

const postSchema = new Schema<postInterface>({ 
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true,
        min: 40
    },
    amount: {
        type: Number,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    work_time: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    images: [
      {
        type: String,
      }
    ],
    skipFrom:{
      type: [Schema.Types.ObjectId],
      ref: "user"
    },
    address: {
      type: String,
      default: ""
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: false },
    },
},{
    timestamps: true
})

postSchema.pre('save', function (next) {
  if (this.lat && this.lng) {
    this.location = {
      type: 'Point',
      coordinates: [this.lat, this.lng],
    };
  }
  next();
});

postSchema.index({ location: "2dsphere" });

export const Post = model<postInterface>('post', postSchema);