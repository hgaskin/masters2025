"use client";

import { dark } from "@clerk/themes";

/**
 * Function that returns the Masters-themed appearance configuration for Clerk components
 * @param customOverrides Optional additional styling overrides
 * @returns Clerk appearance configuration object
 */
export function getMastersClerkTheme(customOverrides = {}) {
  return {
    baseTheme: dark,
    elements: {
      rootBox: {
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
        borderRadius: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      },
      card: {
        backgroundColor: "transparent",
        boxShadow: "none",
      },
      formButtonPrimary: {
        backgroundColor: "#006747",
        "&:hover": {
          backgroundColor: "#005438",
        },
      },
      formFieldInput: {
        borderColor: "rgba(255, 255, 255, 0.2)",
        "&:focus": {
          borderColor: "#006747",
        },
      },
      headerTitle: {
        color: "white",
        fontFamily: "serif",
      },
      headerSubtitle: {
        color: "rgba(255, 255, 255, 0.7)",
      },
      dividerLine: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
      },
      dividerText: {
        color: "rgba(255, 255, 255, 0.7)",
      },
      footerActionLink: {
        color: "#CBDE6A",
        "&:hover": {
          color: "#d9e88d",
        },
      },
      ...customOverrides
    },
  };
} 