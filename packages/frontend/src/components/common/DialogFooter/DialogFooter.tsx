import * as React from "react";
import {Button, Classes, Intent} from "@blueprintjs/core";

export const DialogFooter: React.FunctionComponent<{
  onCancel: () => void;
  onConfirm?: () => void;
  confirmIntent?: Intent;
  cancelText?: string;
  confirmText?: string;
}> = props => (
  <div className={Classes.DIALOG_FOOTER}>
    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
      <Button onClick={props.onCancel}>{ props.cancelText || 'Cancel' }</Button>
      {
        props.onConfirm &&
        <Button onClick={props.onConfirm}
                intent={props.confirmIntent || "primary"}>{props.confirmText || 'Confirm'}</Button>
      }
    </div>
  </div>
);
