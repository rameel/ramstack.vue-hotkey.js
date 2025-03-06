import path from "node:path";
import size from "rollup-plugin-bundle-size";
import terser from "@rollup/plugin-terser";
import typescript from '@rollup/plugin-typescript';
import resolve from "@rollup/plugin-node-resolve";

const terser_options = {
    output: {
        comments: false
    },
    compress: {
        passes: 5,
        ecma: 2020,
        drop_console: false,
        drop_debugger: true,
        pure_getters: true,
        arguments: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true
    }
};

export default [{
    input: "src/vue-hotkey.ts",
    output: [
        {
            file: "dist/vue-hotkey.esm.js",
            format: "esm"
        },
        {
            file: "dist/vue-hotkey.esm.min.js",
            format: "esm",
            plugins: [terser(terser_options)]
        },
        {
            name: "window",
            file: "dist/vue-hotkey.js",
            format: "iife",
            extend: true
        },
        {
            name: "window",
            file: "dist/vue-hotkey.min.js",
            format: "iife",
            extend: true,
            plugins: [terser(terser_options)]
        }
    ],
    plugins: [
        resolve(),
        typescript(),
        trim_ws(),
        size()
    ]
}]

function trim_ws() {
    return {
        name: "trim-ws",
        generateBundle(options, bundle) {
            if (options.file.match(/\.js$/)) {
                const key = path.basename(options.file);
                bundle[key].code = bundle[key].code.trim();
            }
        }
    };
}
