#!/bin/bash

set -e -x

rm -r build || true
mkdir -p build
mkdir -p dist

# Compile src/html_entities.gperf

gperf src/html_entities.gperf > build/html_entities.c

# Build Snudown

./llvmwasm/bin/clang snudown.c -o ./build/snudown_unlinked.bc -emit-llvm --target=wasm32 -Oz -c \
-D NDEBUG \
-I src \
-I html \
-include src/autolink.c \
-include src/buffer.c \
-include src/markdown.c \
-include src/stack.c \
-include html/houdini_href_e.c \
-include html/houdini_html_e.c \
-include html/html.c \
-include build/html_entities.c \
-nostdinc \
-nostdlib \
-fno-builtin \
-isystem ./llvmwasm/musl/lib/musl-wasm32/include \
-isystem ./llvmwasm/musl/lib/musl/include \
-isystem ./llvmwasm/musl/include \
-Wno-tautological-unsigned-zero-compare \
-Wno-logical-op-parentheses \

./llvmwasm/bin/llvm-link ./build/snudown_unlinked.bc ./llvmwasm/musl/lib/webassembly.bc -o ./build/snudown.bc -only-needed

./llvmwasm/bin/llc ./build/snudown.bc -o ./build/snudown.s -asm-verbose=false

./llvmwasm/bin/s2wasm ./build/snudown.s --allocate-stack 65536 > ./build/snudown_unstripped.wat

# remove unnecessary exports
sed -r '/^\s\(export\s"(default_renderer|wiki_renderer|memory|malloc|free)"/p ; /^\s\(export/d' ./build/snudown_unstripped.wat > ./build/snudown.wat

./llvmwasm/bin/wasm-opt ./build/snudown.wat -o ./build/snudown.wasm -Oz

./llvmwasm/bin/wasm-opt ./build/snudown.wasm --print > ./build/snudown_opt.wat

# TODO: investigate this when it doesn't crash
#./llvmwasm/bin/wasm2asm ./build/snudown_opt.wat -o ./dist/snudown_asm.js

node -e " \
var fs = require('fs'); \
var wasm = fs.readFileSync('./build/snudown.wasm'); \
var wasmString = String.fromCharCode.apply(null, new Uint8Array(wasm.buffer)); \
var wrapper = fs.readFileSync('./wrapper.js', 'utf8'); \
var interpolatedWrapper = wrapper.replace('COMPILED_WASM_PLACEHOLDER', JSON.stringify(wasmString)); \
fs.writeFileSync('./build/snudown_unopt.js', interpolatedWrapper); \
"

./node_modules/terser/bin/uglifyjs ./build/snudown_unopt.js -o ./build/snudown_opt.js -m -c --toplevel --comments

node -e " \
var fs = require('fs'); \
var path = require('path'); \
var package = require('./package.json'); \
var source = fs.readFileSync('./build/snudown_opt.js'); \
fs.writeFileSync(package.browser, \
	source); \
fs.writeFileSync(package.module, \
	'import util from \"util\";\\n' + \
	'var TextDecoder = util.TextDecoder;\\n' + \
	'var TextEncoder = util.TextEncoder;\\n' + \
	source); \
fs.writeFileSync(package.main, \
	'module.exports = require(\"esm\")(module, { mode: \"all\" })(\"./' + path.basename(package.module) + '\");'); \
"
