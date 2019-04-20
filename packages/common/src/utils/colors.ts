import {IUserColor} from "../types/users";

// Pasted intents and colors from blueprint instead of importing them, because the utils here are also
// used in the backend and blueprint creates complicated cross references to react etc.
const Intent = {
  NONE: "none" as "none",
  PRIMARY: "primary" as "primary",
  SUCCESS: "success" as "success",
  WARNING: "warning" as "warning",
  DANGER: "danger" as "danger",
};
type Intent = typeof Intent[keyof typeof Intent];

const Colors = {
  BLACK: "#10161A",

  BLUE1: "#0E5A8A",
  BLUE2: "#106BA3",
  BLUE3: "#137CBD",
  BLUE4: "#2B95D6",
  BLUE5: "#48AFF0",

  COBALT1: "#1F4B99",
  COBALT2: "#2458B3",
  COBALT3: "#2965CC",
  COBALT4: "#4580E6",
  COBALT5: "#669EFF",

  DARK_GRAY1: "#182026",
  DARK_GRAY2: "#202B33",
  DARK_GRAY3: "#293742",
  DARK_GRAY4: "#30404D",
  DARK_GRAY5: "#394B59",

  FOREST1: "#1D7324",
  FOREST2: "#238C2C",
  FOREST3: "#29A634",
  FOREST4: "#43BF4D",
  FOREST5: "#62D96B",

  GOLD1: "#A67908",
  GOLD2: "#BF8C0A",
  GOLD3: "#D99E0B",
  GOLD4: "#F2B824",
  GOLD5: "#FFC940",

  GRAY1: "#5C7080",
  GRAY2: "#738694",
  GRAY3: "#8A9BA8",
  GRAY4: "#A7B6C2",
  GRAY5: "#BFCCD6",

  GREEN1: "#0A6640",
  GREEN2: "#0D8050",
  GREEN3: "#0F9960",
  GREEN4: "#15B371",
  GREEN5: "#3DCC91",

  INDIGO1: "#5642A6",
  INDIGO2: "#634DBF",
  INDIGO3: "#7157D9",
  INDIGO4: "#9179F2",
  INDIGO5: "#AD99FF",

  LIGHT_GRAY1: "#CED9E0",
  LIGHT_GRAY2: "#D8E1E8",
  LIGHT_GRAY3: "#E1E8ED",
  LIGHT_GRAY4: "#EBF1F5",
  LIGHT_GRAY5: "#F5F8FA",

  LIME1: "#728C23",
  LIME2: "#87A629",
  LIME3: "#9BBF30",
  LIME4: "#B6D94C",
  LIME5: "#D1F26D",

  ORANGE1: "#A66321",
  ORANGE2: "#BF7326",
  ORANGE3: "#D9822B",
  ORANGE4: "#F29D49",
  ORANGE5: "#FFB366",

  RED1: "#A82A2A",
  RED2: "#C23030",
  RED3: "#DB3737",
  RED4: "#F55656",
  RED5: "#FF7373",

  ROSE1: "#A82255",
  ROSE2: "#C22762",
  ROSE3: "#DB2C6F",
  ROSE4: "#F5498B",
  ROSE5: "#FF66A1",

  SEPIA1: "#63411E",
  SEPIA2: "#7D5125",
  SEPIA3: "#96622D",
  SEPIA4: "#B07B46",
  SEPIA5: "#C99765",

  TURQUOISE1: "#008075",
  TURQUOISE2: "#00998C",
  TURQUOISE3: "#00B3A4",
  TURQUOISE4: "#14CCBD",
  TURQUOISE5: "#2EE6D6",

  VERMILION1: "#9E2B0E",
  VERMILION2: "#B83211",
  VERMILION3: "#D13913",
  VERMILION4: "#EB532D",
  VERMILION5: "#FF6E4A",

  VIOLET1: "#5C255C",
  VIOLET2: "#752F75",
  VIOLET3: "#8F398F",
  VIOLET4: "#A854A8",
  VIOLET5: "#C274C2",

  WHITE: "#FFFFFF",
};

export const userColors: IUserColor[] = [
  {
    name: "Vermilion",
    darkColor: Colors.VERMILION1,
    primaryColor: Colors.VERMILION3,
    lightColor: Colors.VERMILION5
  },
  {
    name: "Rose",
    darkColor: Colors.ROSE1,
    primaryColor: Colors.ROSE3,
    lightColor: Colors.ROSE5
  },
  {
    name: "Violet",
    darkColor: Colors.VIOLET1,
    primaryColor: Colors.VIOLET3,
    lightColor: Colors.VIOLET5
  },
  {
    name: "Indigo",
    darkColor: Colors.INDIGO1,
    primaryColor: Colors.INDIGO3,
    lightColor: Colors.INDIGO5
  },
  {
    name: "Cobalt",
    darkColor: Colors.COBALT1,
    primaryColor: Colors.COBALT3,
    lightColor: Colors.COBALT5
  },
  {
    name: "Turquoise",
    darkColor: Colors.TURQUOISE1,
    primaryColor: Colors.TURQUOISE3,
    lightColor: Colors.TURQUOISE5
  },
  {
    name: "Forest",
    darkColor: Colors.FOREST1,
    primaryColor: Colors.FOREST3,
    lightColor: Colors.FOREST5
  },
  {
    name: "Lime",
    darkColor: Colors.LIME1,
    primaryColor: Colors.LIME3,
    lightColor: Colors.LIME5
  },
  {
    name: "Gold",
    darkColor: Colors.GOLD1,
    primaryColor: Colors.GOLD3,
    lightColor: Colors.GOLD5
  },
  {
    name: "Sepia",
    darkColor: Colors.SEPIA1,
    primaryColor: Colors.SEPIA3,
    lightColor: Colors.SEPIA5
  }
];

export const getColorsFromIntent = (intent: Intent, darkUi?: boolean): [string, string, string, string, string] => {
  switch (intent) {
    case "primary":
      return [Colors.BLUE1, Colors.BLUE2, Colors.BLUE3, Colors.BLUE4, Colors.BLUE5];

    case "success":
      return [Colors.GREEN1, Colors.GREEN2, Colors.GREEN3, Colors.GREEN4, Colors.GREEN5];

    case "danger":
      return [Colors.RED1, Colors.RED2, Colors.RED3, Colors.RED4, Colors.RED5];

    case "warning":
      return [Colors.ORANGE1, Colors.ORANGE2, Colors.ORANGE3, Colors.ORANGE4, Colors.ORANGE5];

    case "none":
    default:
      if (darkUi) {
        return [Colors.DARK_GRAY1, Colors.DARK_GRAY2, Colors.DARK_GRAY3, Colors.DARK_GRAY4, Colors.DARK_GRAY5];
      } else {
        return [Colors.LIGHT_GRAY1, Colors.LIGHT_GRAY2, Colors.LIGHT_GRAY3, Colors.LIGHT_GRAY4, Colors.LIGHT_GRAY5];
      }
  }
};
