import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import {createStore} from "redoodle";
import reducer from "./store";

import "./index.css";
import "react-mosaic-component/react-mosaic-component.css";
import "semantic-ui-css/semantic.css";
import {SocketServer} from "./utils/socket";
import {SocketMessages} from "./types/communication";
import {NewUser, UserChangedData, UserLeft} from "./store/users";
import uuidv4 from 'uuid/v4';
import {IUser} from "./types/users";

const store = createStore(reducer, {
  openFiles: {
    mosaiks: [],
    activeMosaik: ''
  },
  users: {
    users: [],
    colorCounter: 0
  }
});

SocketServer.on<SocketMessages.Users.NewUser>("@@USERS/NEW_USER", ({ userdata }) => {
  console.log(`New user arrived`, userdata);
  store.dispatch(NewUser.create({ userdata }))
});

SocketServer.on<SocketMessages.Users.UserLeft>("@@USERS/USER_LEFT", ({ user }) => {
  console.log(`User left`, user);
  store.dispatch(UserLeft.create({ userid: user }))
});

SocketServer.on<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", ({ user, userdata }) => {
  console.log(`User changed data`, user, userdata);
  store.dispatch(UserChangedData.create({ userid: user, userdata }))
});

const me: IUser = {
  id: SocketServer.getClientId(),
  name: uuidv4(),
  position: {
    path: '',
    selection: {} as any,
    cursor: {} as any
  }
};

store.dispatch(NewUser.create({ userdata: { ...me, isItMe: true } }));
SocketServer.emit<SocketMessages.Users.NewUser>("@@USERS/NEW_USER", { userdata: me });

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById("root"));
