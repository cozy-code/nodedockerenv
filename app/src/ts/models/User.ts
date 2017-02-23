import * as mongoose from 'mongoose';

//http://stackoverflow.com/a/34482413

export interface IUser extends mongoose.Document{
    name: string;
    email: string;
}

export const UserSchima = new mongoose.Schema({
    name: { type:mongoose.Schema.Types.String, required:true},
    email: {type:mongoose.Schema.Types.String}
});

export const User= mongoose.model<IUser>('User',UserSchima);

//export default User;