// eslint.config.js
export default [
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                // Add these to tell ESLint you are building for the web
                window: "readonly",
                document: "readonly",
                HTMLElement: "readonly",
                customElements: "readonly",
                console: "readonly",
                // If you use fetch or localStorage later, add them here too:
                fetch: "readonly"
            }
        },
        rules: {
            "no-undef": "error",
            "semi": ["error", "always"],
            "no-unused-vars": "warn"
        }
    }
];