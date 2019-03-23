import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import {createStore} from "redoodle";
import reducer from "./store";
import {SocketServer} from "./utils/socket";
import {SocketMessages} from "./types/communication";
import {NewUser, UserChangedData, UserLeft} from "./store/users";
import uuidv4 from 'uuid/v4';
import {IUser} from "./types/users";

import "./index.css";
import "react-mosaic-component/react-mosaic-component.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import {FocusStyleManager} from "@blueprintjs/core";

FocusStyleManager.onlyShowFocusOnTabs();

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
  id: '',
  name: '',
  position: {
    path: '',
    selection: {} as any,
    cursor: {} as any
  }
};

SocketServer.emit<SocketMessages.Users.UserInitialized>("@@USERS/INITIALIZE_USER", {});
SocketServer.on<SocketMessages.Users.UserInitializedResponse>("@@USERS/INITIALIZE_RESPONSE", payload => {
  store.dispatch(NewUser.create({
    userdata: {
      ...me,
      isItMe: true,
      name: payload.name,
      id: payload.id
    }
  }));

  ReactDOM.render((
    <Provider store={store}>
      <App />
    </Provider>
  ), document.getElementById("root"));
});
