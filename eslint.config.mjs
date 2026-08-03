import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default defineConfig([{
    extends: [
        ...nextCoreWebVitals,
        ...nextTypescript
    ],

    rules: {
        // jsx-a11y plugin'i eslint-config-next içinden gelir; recommended preset
        // plugin'i yeniden tanımlamadan kuralları spread ederek uygulanır
        ...jsxA11y.flatConfigs.recommended.rules,
        "jsx-a11y/anchor-is-valid": "warn",
        "jsx-a11y/heading-has-content": "error",
        "jsx-a11y/no-redundant-roles": "warn",
        "jsx-a11y/label-has-associated-control": "warn",
        "jsx-a11y/click-events-have-key-events": "warn",
        "jsx-a11y/no-static-element-interactions": "warn",
        "jsx-a11y/no-noninteractive-element-interactions": "warn",
        "jsx-a11y/no-autofocus": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@next/next/no-img-element": "warn",

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        }],

        "react/no-unescaped-entities": ["error", {
            forbid: [">", "}"],
        }],

        "no-restricted-syntax": ["warn", {
            selector: "JSXAttribute[name.name='style']",
            message: "Inline style kullanma. Tailwind class veya CSS variable kullan.",
        }],

        // React Compiler danışmanlık kuralları: proje şu an React Compiler
        // kullanmıyor; admin panelindeki kademeli geçiş için uyarı seviyesinde tutulur
        "react-hooks/immutability": "warn",
        "react-hooks/refs": "warn",
        "react-hooks/static-components": "warn",
        "react-hooks/preserve-manual-memoization": "warn",
        "react-hooks/set-state-in-effect": "warn",
        "react-hooks/error-boundaries": "warn",
    },
}, {
    files: ["**/*.test.ts", "**/*.test.tsx"],

    languageOptions: {
        globals: {
            ...globals.jest,
            ...globals.node,
        },
    },

    rules: {
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-unused-vars": "off",
    },
}, {
    files: ["*.config.js", "scripts/**/*.js"],

    languageOptions: {
        globals: {
            ...globals.node,
        },
    },

    rules: {
        // Kök config dosyaları ve Node scriptleri CommonJS çalışır
        "@typescript-eslint/no-require-imports": "off",
    },
}, {
    files: ["src/app/api/**/*.{ts,tsx}"],

    rules: {
        "@typescript-eslint/no-explicit-any": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
        }],
    },
}, {
    files: ["src/instrumentation*.ts", "src/lib/monitoring.ts"],

    rules: {
        "@typescript-eslint/no-require-imports": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
        }],
    },
}]);