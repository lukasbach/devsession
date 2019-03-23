import * as React from "react";
import {IUserWithLocalData} from "../../store/users";
import {Button, Card, Form} from "semantic-ui-react";
import {useState} from "react";
import {SocketServer} from "../../utils/socket";
import {SocketMessages} from "../../types/communication";

export const UserCard: React.FunctionComponent<{
  user: IUserWithLocalData
}> = props => {
  const [editModel, setEditModel] = useState<IUserWithLocalData | null>(null);

  return (
    <div>
      <Card
        style={{ margin: '.2em' }}
        fluid
      >
        <Card.Content>
          <Card.Header>{ editModel ? 'Editing your profile' : props.user.name }</Card.Header>
          <Card.Description>
            {
              editModel && <Form>
                <Form.Input fluid label='Name' value={editModel.name} onChange={(e, { name, value }) => setEditModel({...editModel, name: value})} />
                  <Button
                    content={'Apply'}
                    primary={true}
                    onClick={() => {
                      SocketServer.emit<SocketMessages.Users.UserChangedData>("@@USERS/USER_CHANGED_DATA", {
                        userdata: editModel,
                        user: props.user.id
                      });
                      setEditModel(null);
                    }}
                  />
              </Form>
            }
            {
              !editModel && <>
                {JSON.stringify(props.user)}
              </>
            }
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          {
            props.user.isItMe
              ? <>
                  <Button onClick={() => setEditModel(props.user)} content={'Edit'} primary={true} />
                </>
              : <>
                  actions
                </>
          }
        </Card.Content>
      </Card>
    </div>
  )
};