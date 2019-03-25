import {IState} from "./index";
import {IUser} from "../types/users";

export const getMe = (state: IState): IUser => {
  const me = state.users.users.find(u => !!u.isItMe);

  if (!me) {
    throw Error('Attempted to find user profile, but user profile was not in Redux State Store.');
  } else {
    return me;
  }
};
