import {Colors, Intent} from "@blueprintjs/core";
import {IUserColor} from "../types/users";

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

