import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import {defaultState, initializeStore} from "./store";
import {FocusStyleManager} from "@blueprintjs/core";
import {SocketStoreBindingService} from "./services/SocketStoreBindingService";

import "./index.css";
import "./noselect.css";
import "react-mosaic-component/react-mosaic-component.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import {App} from "./App";

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

  // if (window.localStorage) {
  //   window.localStorage.setItem('userdata', JSON.stringify(oldAuthData));
  // }

ReactDOM.render((
  <StoreProvider>
    <App />
  </StoreProvider>
), document.getElementById("root"));