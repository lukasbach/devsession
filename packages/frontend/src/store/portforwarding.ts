import {setWith, TypedAction, TypedReducer} from "redoodle";
import {IPortForwardingConfiguration} from "../types/portforwarding";

export interface IPortForwardingState {
  configurations: IPortForwardingConfiguration[];
  isPortForwardingManagerOpen: boolean;
}

export const NewPortForwardingConfiguration = TypedAction.define("@@portforwarding/new")<{
  config: IPortForwardingConfiguration;
}>();

export const DeletePortForwardingConfiguration = TypedAction.define("@@portforwarding/delete")<{
  configId: number;
}>();

export const OpenPortForwardingManager = TypedAction.define("@@portforwarding/open_manager")<{}>();
export const ClosePortForwardingManager = TypedAction.define("@@portforwarding/close_manager")<{}>();


const reducer = TypedReducer.builder<IPortForwardingState>()
  .withHandler(NewPortForwardingConfiguration.TYPE, (state, { config }) => setWith(state, {
    configurations: [...state.configurations, config]
  }))
  .withHandler(DeletePortForwardingConfiguration.TYPE, (state, { configId }) => setWith(state, {
    configurations: state.configurations.filter(t => t.id !== configId)
  }))
  .withHandler(OpenPortForwardingManager.TYPE, state => setWith(state, { isPortForwardingManagerOpen: true }))
  .withHandler(ClosePortForwardingManager.TYPE, state => setWith(state, { isPortForwardingManagerOpen: false }))
  .build();

export default reducer;