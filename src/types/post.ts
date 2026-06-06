
export type postT = {
    createdBy: any,
    title: string,
    description: string,
    amount: number,
    work_time: Date,
    deadline: Date,
    images: string[],
    location: any
    address: string
}

export type updatePostT = {
    postId: any,
    createdBy: any,
    title: string,
    description: string,
    amount: number,
    work_time: Date,
    deadline: Date,
    images: any,
    oldImages: any,
    location: any,
    lat: number,
    lng: number
}