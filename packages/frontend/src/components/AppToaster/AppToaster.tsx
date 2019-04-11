import * as React from "react";
import {Toaster} from "@blueprintjs/core";

export let appToasterRef = Toaster.create({
  position: 'top-right',
  canEscapeKeyClear: true
});
