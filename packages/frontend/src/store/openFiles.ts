import {setWith, TypedAction, TypedReducer} from "redoodle";
import {IUserEditorPosition, IUserEditorPositionWithRequiredPath} from "@devsession/common";

export interface IOpenFilesState {
  mosaiks: Array<{
    id: string;
    files: string[];
    activeFile?: string;
  }>,
  activeMosaik: string;
  lastNavigationPosition?: IUserEditorPositionWithRequiredPath;
}

export const OpenFile = TypedAction.define("@@openfiles/open")<{
  path: string;
  mosaik?: string;
}>();

export const CloseFile = TypedAction.define("@@openfiles/close")<{
  path: string;
  mosaik?: string;
}>();

export const SwitchActiveEditorMosaik = TypedAction.define("@@openfiles/switchmosaik")<{
  mosaik: string;
}>();

export const AddEditorMosaik = TypedAction.define("@@openfiles/addmosaik")<{
  mosaik: string;
}>();

export const RemoveEditorMosaik = TypedAction.define("@@openfiles/removemosaik")<{
  mosaik: string;
}>();

export const NavigateTo = TypedAction.define("@@openfiles/navigate")<{
  position: IUserEditorPosition | undefined;
}>();

const reducer = TypedReducer.builder<IOpenFilesState>()
  .withHandler(OpenFile.TYPE, (state, { path, mosaik }) => {
    return setWith(state, {
      mosaiks: state.mosaiks.map(m => m.id === (mosaik || state.activeMosaik) ? {
        ...m,
        files: m.files.find(f => f === path) ? m.files : [...m.files, path],
        activeFile: path
      } : m)
    });
  })
  .withHandler(CloseFile.TYPE, (state, { path, mosaik }) => {
    return setWith(state, {
      mosaiks: state.mosaiks.map(m => m.id === (mosaik || state.activeMosaik) ? {
        ...m,
        files: m.files.filter(f => f !== path),
        activeFile: m.activeFile === path
          ? m.files.filter(f => f !== path).length > 0
            ? m.files.filter(f => f !== path)[0]
            : undefined
          : m.activeFile
      } : m)
    });
  })
  .withHandler(SwitchActiveEditorMosaik.TYPE, (state, { mosaik }) => setWith(state, { activeMosaik: mosaik }))
  .withHandler(AddEditorMosaik.TYPE, (state, { mosaik }) => setWith(state, {
    mosaiks: [...state.mosaiks, { id: mosaik, activeFile: '', files: [] }]
  }))
  .withHandler(RemoveEditorMosaik.TYPE, (state, { mosaik }) => setWith(state, {
    mosaiks: state.mosaiks.filter(m => m.id !== mosaik)
  }))
  .withHandler(NavigateTo.TYPE, (state, { position }) => {
    if (!position) {
      return setWith(state, { lastNavigationPosition: undefined });
    }

    const activeMosaik = state.mosaiks.find(m => m.id === state.activeMosaik);

    if (!activeMosaik || !position.path) {
      return state;
    }

    if (!activeMosaik.files.includes(position.path!)) {
      activeMosaik.files.push(position.path!);
    }

    activeMosaik.activeFile = position.path;


    return setWith(state, {
      lastNavigationPosition: position as IUserEditorPositionWithRequiredPath
    });
  })
  .build();

export default reducer;