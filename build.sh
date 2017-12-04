#!/bin/bash

set -e

mkdir -p "build"
mkdir -p "dist"

# Compile src/html_entities.gperf

gperf src/html_entities.gperf > build/html_entities.c

# Build Snudown

files="snudown.c src/autolink.c src/buffer.c src/markdown.c src/stack.c html/houdini_href_e.c html/houdini_html_e.c html/html.c build/html_entities.c"
include=("src" "html")
exported=("default_renderer" "wiki_renderer")
options=("ERROR_ON_UNDEFINED_SYMBOLS=1" "NO_EXIT_RUNTIME=1" "EXPORTED_RUNTIME_METHODS=[]" "NO_FILESYSTEM=1" "MEM_INIT_METHOD=2" "NODEJS_CATCH_EXIT=0")

if [ "$1" = "-d" ] || [ "$1" = "--debug" ]; then
	optimization=""
else
	echo "*** DEBUGGING OFF : use -d to enable ***"
	optimization="-Oz --llvm-lto 1 --closure 1 --memory-init-file 0 -DNDEBUG -s ABORTING_MALLOC=0"
fi

cmd="emcc $files -o build/snudown_emscripten.js --pre-js header.js --post-js footer.js $optimization"

for i in "${options[@]}"; do
	cmd="$cmd -s $i"
done

for i in "${include[@]}"; do
	cmd="$cmd -I$i"
done

cmd="$cmd -s EXPORTED_FUNCTIONS=["
for i in "${exported[@]}"; do
	cmd="$cmd'_$i',"
done
cmd="${cmd:0:${#cmd} - 1}" # trim last comma
cmd="$cmd]"

$cmd

# Remove line breaks which closure randomly inserts, breaking sed replacements
./node_modules/uglify-es/bin/uglifyjs ./build/snudown_emscripten.js -o ./build/snudown_oneline.js --comments

# Remove `require()` calls from compiled code
# (used for filesystem operations, but aren't removed by `-s NO_FILESYSTEM=1`)
sed -r 's/require\("[^"]*"\)/{}\/*removed &*\//g' ./build/snudown_oneline.js > ./build/snudown_norequire.js
# Remove IIFE wrapper (for exports)
sed -r 's/^\(function\(\)\{// ; s/\}\)\(\);//' ./build/snudown_norequire.js > ./build/snudown_nowrapper.js
# Convert window exports to ES exports
sed -r 's/window\.(\w+)=function/export function \1/g' ./build/snudown_nowrapper.js > ./build/snudown_exports.js

# Minify
compress_options=("negate_iife=false" "hoist_props" "keep_fargs=false" "passes=3" "pure_getters=true" "toplevel" "unsafe")
mangle_options=("toplevel")
beautify_options=("beautify=false" "wrap_iife")

uglify="./node_modules/uglify-es/bin/uglifyjs ./build/snudown_exports.js -o ./build/snudown_uglify.js --comments"

uglify="$uglify -c "
for i in "${compress_options[@]}"; do
	uglify="$uglify$i,"
done
uglify="${uglify:0:${#uglify} - 1}" # trim last comma

uglify="$uglify -m "
for i in "${mangle_options[@]}"; do
	uglify="$uglify$i,"
done
uglify="${uglify:0:${#uglify} - 1}" # trim last comma

uglify="$uglify -b "
for i in "${beautify_options[@]}"; do
	uglify="$uglify$i,"
done
uglify="${uglify:0:${#uglify} - 1}" # trim last comma

$uglify

echo "module.exports = require('@std/esm')(module, { esm: 'js' })('./snudown_es.js');" > ./dist/snudown.js
cp ./build/snudown_uglify.js ./dist/snudown_es.js

rm -r "build"
