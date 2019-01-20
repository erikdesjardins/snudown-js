#!/bin/bash

set -e -x

rm -r build || true
mkdir -p build
mkdir -p dist

# Compile src/html_entities.gperf

gperf src/html_entities.gperf > build/html_entities.c

# Build Snudown

# todo https://github.com/kripken/emscripten/pull/7733#event-2063926781

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
sed -r '/^\s\(export\s"(default_renderer|wiki_renderer|malloc|free)"/p ; /^\s\(export/d' ./build/snudown_unstripped.wat > ./build/snudown.wat

./llvmwasm/bin/wasm-opt ./build/snudown.wat -o ./build/snudown_opt.wasm -Oz

./llvmwasm/bin/wasm-opt ./build/snudown_opt.wasm --print > ./build/snudown_opt.wat

./llvmwasm/bin/wasm2asm ./build/snudown_opt.wat -o ./build/snudown_asm.js

# todo upstream this
sed 's/}; else/} else/ ; s/FUNCTION_TABLE_3/FUNCTION_TABLE_iii/' ./build/snudown_asm.js > ./build/snudown_fixed.js

# manually inline asmFunc
sed '/^function asmFunc(global, env, buffer) {/d ; /^}/d' ./build/snudown_fixed.js > ./build/snudown_flattened.js
sed 's/return {/var wasm = {/' ./build/snudown_flattened.js > ./build/snudown_returned.js

cat ./header.js ./build/snudown_returned.js ./footer.js > ./build/snudown_wrapped.js

./node_modules/babel-cli/bin/babel.js ./build/snudown_wrapped.js -o ./build/snudown_opt.js \
--no-babelrc \
--presets=more-optimization \

./node_modules/terser/bin/uglifyjs ./build/snudown_opt.js -o ./build/snudown_min.js \
--comments \
--toplevel \
-c negate_iife=false,keep_fargs=false,passes=10,pure_getters,unsafe \
-m \
-b beautify=false,wrap_iife \

node -e " \
var fs = require('fs'); \
var path = require('path'); \
var package = require('./package.json'); \
var source = fs.readFileSync('./build/snudown_min.js'); \
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
