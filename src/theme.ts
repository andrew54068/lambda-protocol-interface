import boTheme from "@blocto/web-chakra-theme";
import { extendTheme } from "@chakra-ui/react";
import merge from "lodash.merge";

import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    bg: " background.secondary",
    color: "font.highlight",
    py: "4px",
    px: "10px",
  },
});
const tagTheme = defineMultiStyleConfig({
  baseStyle,
});

const IS_PROD = import.meta.env.VITE_APP_ENV === "production";

const theme = extendTheme(
  merge(boTheme, {
    semanticTokens: {
      colors: {
        "network.hint": IS_PROD ? "transparent" : "status.warning.light",
        "network.hint.text": IS_PROD ? "transparent" : "status.warning.dark",
      },
    },
    styles: {
      global: {
        html: {
          fontSize: "16px",
        },
        "html body": {
          minHeight: "100%",
          width: "100%",
        },
        body: {
          fontFamily: "boFontFamily.base",
          fontSize: "size.body.3",
          lineHeight: "line.height.body.3",
          color: "font.primary",
          textRendering: "geometricPrecision",
          bg: "white",
        },
        "body.fontLoaded": {
          fontFamily: "boFontFamily.base",
        },
        button: {
          textRendering: "geometricPrecision",
          WebkitTapHighlightColor: "transparent",
        },
        "[role=button]": {
          WebkitTapHighlightColor: "transparent",
        },
      },
    },
    components: {
      Tag: tagTheme,
      Button: {
        fontSize: "size.heading.5",
        fontWeight: "weight.l",
        lineHeight: "line.height.heading.4",
        baseStyle: {
          _hover: {
            transform: "scale(0.98)",
            _disabled: { transform: "none" },
          },
          _active: {
            transform: "scale(0.96)",
            _disabled: { transform: "none" },
          },
          _disabled: {
            cursor: "not-allowed",
          },
        },
        variants: {
          primary: {
            width: "100%",
            height: "54px",
            py: "space.m",
            bg: "interaction.primary",
            color: "font.inverse",
            borderRadius: "12px",
            _hover: {
              bg: { md: "interaction.primary.hovered" },
              _disabled: { bg: "interaction.primary.disabled" },
            },
            _active: {
              bg: "interaction.primary.pressed",
            },
            _disabled: {
              bg: "interaction.primary.disabled",
            },
          },
          secondary: {
            width: "100%",
            height: "54px",
            py: "space.m",
            bg: "interaction.secondary",
            color: "font.highlight",
            borderRadius: "12px",
            _hover: {
              bg: { md: "interaction.secondary.hovered" },
            },
            _active: {
              bg: "interaction.secondary.pressed",
            },
            _disabled: {
              bg: "interaction.secondary.disabled",
            },
          },
          support: {
            height: "46px",
            py: "space.s",
            px: "space.m",
            bg: "interaction.primary",
            color: "font.inverse",
            borderRadius: "100px",
            _hover: {
              bg: { md: "interaction.primary.hovered" },
              _disabled: { bg: "interaction.primary.disabled" },
            },
            _active: {
              bg: "interaction.primary.pressed",
            },
            _disabled: {
              bg: "interaction.primary.disabled",
            },
          },
          plain: {
            padding: 0,
            fontSize: "size.body.3",
            fontWeight: "weight.s",
            lineHeight: "line.height.body.3",
            _active: {
              color: "font.primary.pressed",
              svg: { fill: "icon.secondary" },
              _disabled: { color: "inherit", svg: { fill: "icon.primary" } },
            },
          },
        },
      },
    },
  })
);

export default theme;
