import "@emotion/react";

type HexColor = `#${string}`;
type RGBColor = `rgb(${number}, ${number}, ${number})`;
type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;

declare module "@emotion/react" {
  export type Color = HexColor | RGBColor | RGBAColor;
  export interface Theme {
    background1: Color;
    background2: Color;
    background3: Color;
    background4: Color;
    text1: Color;
    text2: Color;
    text3: Color;
    text4: Color;
    border1: Color;
    border2: Color;
    border3: Color;
    border4: Color;
    primary1: Color;
    primary2: Color;
    secondary1: Color;
    secondary2: Color;
    tertiary1: Color;
    tertiary2: Color;
    quaternary1: Color;
    quaternary2: Color;
    positive1: Color;
    positive2: Color;
    negative1: Color;
    negative2: Color;
    grey1: Color;
    grey2: Color;
    grey3: Color;
    grey4: Color;
    yellow1: Color;
    yellow2: Color;
  }
}
