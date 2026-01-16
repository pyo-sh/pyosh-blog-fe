import { css } from "@emotion/react";

export const TRANSITION_DELAY_COLOR = "0.25s";
export const TRANSITION_DELAY_BG_COLOR = "0.4s";
export const TRANSITION_DELAY_TRANSFORM = "0.3s";

export const TRANSITION_THEME = css`
  transition:
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR};
  -webkit-transition:
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR};
  -moz-transition:
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR};
  -o-transition:
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR};
`;

export const TRANSITION_COLOR = css`
  transition: color ${TRANSITION_DELAY_COLOR};
  -webkit-transition: color ${TRANSITION_DELAY_COLOR};
  -moz-transition: color ${TRANSITION_DELAY_COLOR};
  -o-transition: color ${TRANSITION_DELAY_COLOR};
`;

export const TRANSITION_BG_COLOR = css`
  transition: background-color ${TRANSITION_DELAY_BG_COLOR};
  -webkit-transition: background-color ${TRANSITION_DELAY_BG_COLOR};
  -moz-transition: background-color ${TRANSITION_DELAY_BG_COLOR};
  -o-transition: background-color ${TRANSITION_DELAY_BG_COLOR};
`;

export const TRANSITION_SVG_COLOR = css`
  & > * {
    transition-property: fill stroke;
    -webkit-transition-property: fill stroke;
    -moz-transition-property: fill stroke;
    -o-transition-property: fill stroke;
    transition-duration: ${TRANSITION_DELAY_COLOR};
    -webkit-transition-duration: ${TRANSITION_DELAY_COLOR};
    -moz-transition-duration: ${TRANSITION_DELAY_COLOR};
    -o-transition-duration: ${TRANSITION_DELAY_COLOR};
  }
`;

export const TRANSITION_SVG_BG_COLOR = css`
  & > * {
    transition-property: fill stroke;
    -webkit-transition-property: fill stroke;
    -moz-transition-property: fill stroke;
    -o-transition-property: fill stroke;
    transition-duration: ${TRANSITION_DELAY_BG_COLOR};
    -webkit-transition-duration: ${TRANSITION_DELAY_BG_COLOR};
    -moz-transition-duration: ${TRANSITION_DELAY_BG_COLOR};
    -o-transition-duration: ${TRANSITION_DELAY_BG_COLOR};
  }
`;

export const TRANSITION_BOX_SHADOW_COLOR = css`
  transition-property: box-shadow;
  -webkit-transition-property: box-shadow;
  -moz-transition-property: box-shadow;
  -o-transition-property: box-shadow;
  transition-duration: ${TRANSITION_DELAY_COLOR};
  -webkit-transition-duration: ${TRANSITION_DELAY_COLOR};
  -moz-transition-duration: ${TRANSITION_DELAY_COLOR};
  -o-transition-duration: ${TRANSITION_DELAY_COLOR};
`;

export const transitionWithColor = (target: string) => css`
  transition:
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR},
    ${target};
  -webkit-transition:
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR},
    ${target};
  -moz-transition:
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR},
    ${target};
  -o-transition:
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR},
    ${target};
`;
