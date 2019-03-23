# API

## Data API

* _/fs/dir/:path_: ``Array<{ path, filename, isDir }>``
* _/fs/contents/:path_: ``Array<{ path, filename, content }>``


## Socket events

### Bidirectional

* _editfile_: ``{ user, path, changeobject }``
* _movecursor_: ``{ user, path, cursorpositionobject }``
* _moveselection_: ``{ user, path, selectionobject }``

