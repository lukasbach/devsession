import * as React from "react";
import {IUserWithLocalData} from "../../store/users";
import {useState} from "react";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";

export const UserCard: React.FunctionComponent<{
  user: IUserWithLocalData
}> = props => {
  const [editModel, setEditModel] = useState<IUserWithLocalData | null>(null);

  return (
    <div>
      <div
        style={{ margin: '.2em' }}
      >
        <div>
          <div>{ editModel ? 'Editing your profile' : props.user.name }</div>
          <div>
            {JSON.stringify(props.user)}
          </div>
        </div>
      </div>
    </div>
  )
};