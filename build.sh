#!/bin/bash

set -e -x

mkdir -p "build"

# Compile src/html_entities.gperf

gperf src/html_entities.gperf > build/html_entities.c

# Build Snudown

emcc snudown.c src/autolink.c src/buffer.c src/markdown.c src/stack.c html/houdini_href_e.c html/houdini_html_e.c html/html.c build/html_entities.c \
-I src -I html \
--pre-js header.js --post-js footer.js \
-o build/snudown_emscripten.js \
-Oz --llvm-lto 1 --closure 2 -DNDEBUG \
--memory-init-file 0 \
-s MEM_INIT_METHOD=2 \
-s EXPORTED_FUNCTIONS=[\'_default_renderer\',\'_wiki_renderer\'] \
-s EXPORTED_RUNTIME_METHODS=[] \
-s NO_EXIT_RUNTIME=1 \
-s NO_FILESYSTEM=1 \
-s ABORTING_MALLOC=0 \
-s ERROR_ON_UNDEFINED_SYMBOLS=1 \
-s NODEJS_CATCH_EXIT=0 \
-Wno-tautological-compare \
-Wno-logical-op-parentheses \
-Wno-almost-asm \

# Remove line breaks which closure randomly inserts, breaking sed replacements
./node_modules/uglify-js/bin/uglifyjs ./build/snudown_emscripten.js -o ./build/snudown_oneline.js --comments

# Remove `require()` calls from compiled code
# (used for filesystem operations, but aren't removed by `-s NO_FILESYSTEM=1`)
sed -r 's/require\("[^"]*"\)/{}\/*removed &*\//g' ./build/snudown_oneline.js > ./build/snudown_norequire.js
# Remove IIFE wrapper (for exports)
sed -r 's/\(function\(\)\{// ; s/\}\)\(\);//' ./build/snudown_norequire.js > ./build/snudown_nowrapper.js

# Minify
./node_modules/uglify-js/bin/uglifyjs ./build/snudown_nowrapper.js -o ./build/snudown_uglify.js \
--comments \
--toplevel \
-c negate_iife=false,keep_fargs=false,passes=10,pure_getters,unsafe \
-m \
-b beautify=false,wrap_iife \
--define Module=null \

# Convert window exports to ES exports
sed -r 's/,window\.(\w+)=function/;export function \1/g' ./build/snudown_uglify.js > ./build/snudown_exports.js

# Generate modules
mkdir -p "dist"
echo "module.exports = require('@std/esm')(module, { esm: 'js' })('./snudown_es.js');" > ./dist/snudown.js
cp ./build/snudown_exports.js ./dist/snudown_es.js

rm -r "build"
