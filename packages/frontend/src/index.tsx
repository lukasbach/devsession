import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import {defaultState, initializeStore, IState} from "./store";
import {SocketServer} from "./utils/socket";
import {SocketMessages} from "./types/communication";
import {NewUser, UserChangedData, UserLeft} from "./store/users";
import {IUser} from "./types/users";
import {FocusStyleManager} from "@blueprintjs/core";

import "./index.css";
import "react-mosaic-component/react-mosaic-component.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import {SocketStoreBindingService} from "./services/SocketStoreBindingService";
import {Store} from "redux";

FocusStyleManager.onlyShowFocusOnTabs();

/*let oldAuthData: {userId: string, authkey: string};

if (window.localStorage) {
  const storedItem = window.localStorage.getItem('userdata');
  if (storedItem) {
    try {
      const { userId, authkey } = JSON.parse(storedItem);
      oldAuthData = { userId, authkey };
    } catch(e) {}
  }
}*/

const store = initializeStore(defaultState);
export const StoreProvider: React.FunctionComponent<{}> = props => (
  <Provider store={store}> { props.children } </Provider>
);

SocketStoreBindingService.bindSocketMessagesToStore(store);

SocketServer.emitUnauthorized<SocketMessages.Users.UserInitialized>("@@USERS/INITIALIZE_USER", {
  adminKey: new URLSearchParams(window.location.search).get('adminkey') || undefined
});
SocketServer.on<SocketMessages.Users.UserInitializedResponse>("@@USERS/INITIALIZE_RESPONSE", payload => {
  SocketServer.setAuth(payload.user.id, payload.authkey);

  // if (window.localStorage) {
  //   window.localStorage.setItem('userdata', JSON.stringify(oldAuthData));
  // }

  store.dispatch(NewUser.create({
    userdata: {
      ...payload.user,
      isItMe: true
    }
  }));

  ReactDOM.render((
    <StoreProvider>
      <App />
    </StoreProvider>
  ), document.getElementById("root"));
});
