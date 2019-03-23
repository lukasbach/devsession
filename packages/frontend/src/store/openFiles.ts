import {setWith, TypedAction, TypedReducer} from "redoodle";

export interface IOpenFilesState {
  mosaiks: Array<{
    id: string;
    files: string[];
    activeFile: string;
  }>,
  activeMosaik: string
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
        files: m.files.filter(f => f !== path)
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
  .build();

export default reducer;