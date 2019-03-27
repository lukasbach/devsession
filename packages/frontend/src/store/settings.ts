import {setWith, TypedAction, TypedReducer} from "redoodle";
import {IUser} from "../types/users";
import {DeepPartial} from "../types/deeppartial";
import {mergeDeep} from "../utils/deepmerge";
import {ISettings} from "../types/settings";

export const ApplySettings = TypedAction.define("@@settings/apply")<{
  settings: DeepPartial<ISettings>
}>();

export const OpenSettings = TypedAction.define("@@settings/open")<{}>();

export const CloseSettings = TypedAction.define("@@settings/close")<{}>();

const reducer = TypedReducer.builder<ISettings>()
  .withHandler(ApplySettings.TYPE, (state, { settings }) => mergeDeep(state, settings))
  .withHandler(OpenSettings.TYPE, state => setWith(state, { areSettingsOpen: true }))
  .withHandler(CloseSettings.TYPE, state => setWith(state, { areSettingsOpen: false }))
  .build();

export default reducer;