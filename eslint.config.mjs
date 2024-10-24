import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

// Configuration for both client and server
export default [
	{
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], // Matches all JavaScript and TypeScript files
		languageOptions: {
			globals: { ...globals.browser, ...globals.node } // Both browser and Node.js environments
		},
		rules: {
			// General rules for both client and server
			"no-unused-vars": "warn",
			"no-console": "off"
		}
	},

	// Configuration specifically for the server folder
	{
		files: ["server/**/*.{js,ts}"], // All JS/TS files in the server folder
		languageOptions: {
			globals: globals.node // Node.js environment for the server
		},
		rules: {
			// Server-specific rules
			"no-process-exit": "error" // Example: forbid process.exit() calls on the server
		}
	},

	// Configuration specifically for the client folder
	{
		files: ["client/**/*.{js,jsx,ts,tsx}"], // All JS/TS/JSX/TSX files in the client folder
		languageOptions: {
			globals: globals.browser // Browser environment for the client
		},
		settings: {
			react: {
				version: "detect" // Automatically detect the React version
			}
		},
		rules: {
			// Client-specific rules (e.g., React-related rules)
			"react/prop-types": "off",
			"react/jsx-uses-react": "off",
			"react/react-in-jsx-scope": "off" // No need to import React in JSX files (for React 17+)
		}
	},

	// Base configurations
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		plugins: {
			prettier: pluginPrettier, // Define plugins as an object
		},
		rules: {
			"prettier/prettier": "error", // Set Prettier rule
		},
	},
];