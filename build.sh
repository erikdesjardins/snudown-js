#!/bin/bash

mkdir -p "build"

# Compile src/html_entities.gperf

gperf src/html_entities.gperf > build/html_entities.c

# Build Snudown

files="snudown.c src/autolink.c src/buffer.c src/markdown.c src/stack.c html/houdini_href_e.c html/houdini_html_e.c html/html.c build/html_entities.c"
include=("src" "html")
exported=("default_renderer" "wiki_renderer" "snudown_md" "version" "main")
exported_runtime=("ccall" "cwrap" "lengthBytesUTF8" "allocate" "intArrayFromString" "ALLOC_NORMAL" "Pointer_stringify" "UTF8ToString")
# ELIMINATE_DUPLICATE_FUNCTIONS=1 is expensive and only saves a few kB
# MEM_INIT_METHOD=2 may not compile correctly on Windows
options=("ERROR_ON_UNDEFINED_SYMBOLS=1" "NO_EXIT_RUNTIME=1" "NO_FILESYSTEM=1" "NO_DYNAMIC_EXECUTION=1" "MEM_INIT_METHOD=2")

if [ "$1" = "-d" ] || [ "$1" = "--debug" ]; then
	optimization=""
else
	echo "*** DEBUGGING OFF : use -d to enable ***"
	optimization="-Oz --llvm-lto 1 --memory-init-file 0"
fi

cmd="emcc $files -o build/snudown.js --pre-js header.js --post-js footer.js $optimization"

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

cmd="$cmd -s EXPORTED_RUNTIME_METHODS=["
for i in "${exported_runtime[@]}"; do
	cmd="$cmd'$i',"
done
cmd="${cmd:0:${#cmd} - 1}" # trim last comma
cmd="$cmd]"

$cmd

# Remove `require()` calls from compiled code
# (used for filesystem operations, but aren't removed by `-s NO_FILESYSTEM=1`)
sed -r 's/require\("[^"]*"\)/{}\/*removed &*\//g' ./build/snudown.js > ./build/snudown2.js

# Minify
compress_options=("negate_iife=false" "hoist_props" "keep_fargs=false" "passes=3" "pure_getters=true" "toplevel" "unsafe")
mangle_options=("toplevel")
beautify_options=("beautify=false" "wrap_iife")

uglify="./node_modules/uglify-js/bin/uglifyjs ./build/snudown2.js -o ./dist/snudown.js --comments"

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

rm -r "build"
