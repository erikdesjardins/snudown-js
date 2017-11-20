#!/bin/bash

# https://github.com/nodeca/multimath/blob/f5c4952da2998cf6d3dc91967d33935670710fd1/support/llvmwasm_install.sh

set -e -x

STAGE=${1:-1}
WORKDIR=$(pwd)/llvmwasm

# "stable" branch
LLVM_REVISION=314578
# version 1.38.3+ ("wasm2asm: Finish i64 lowering operations" + 1)
BINARYEN_COMMIT=74339e3
# https://github.com/dcodeIO/webassembly
WEBASSEMBLY_COMMIT=091ef9b

mkdir -p $WORKDIR

# skipped by default to avoid installing stuff without warning
if [ $STAGE -le 0 ]
then
sudo apt -qq install g++-multilib gperf
fi

if [ $STAGE -le 1 ]
then
cd $WORKDIR
svn co -q http://llvm.org/svn/llvm-project/llvm/trunk@$LLVM_REVISION llvm
cd $WORKDIR/llvm/tools
svn co -q http://llvm.org/svn/llvm-project/cfe/trunk@$LLVM_REVISION clang
fi

if [ $STAGE -le 2 ]
then
mkdir -p $WORKDIR/llvm-build
cd $WORKDIR/llvm-build
cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX=$WORKDIR -DLLVM_TARGETS_TO_BUILD= -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD=WebAssembly -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=gold" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=gold" -DCMAKE_BUILD_TYPE=MinSizeRel $WORKDIR/llvm > /dev/null
make -j $(nproc)
make install > /dev/null
fi

if [ $STAGE -le 3 ]
then
mkdir -p $WORKDIR/binaryen
cd $WORKDIR/binaryen
git init -q
git fetch -q https://github.com/WebAssembly/binaryen.git
git checkout -q $BINARYEN_COMMIT
cmake -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=gold" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=gold" -DCMAKE_BUILD_TYPE=MinSizeRel -DCMAKE_INSTALL_PREFIX=$WORKDIR . > /dev/null
make -j $(nproc)
make install > /dev/null
fi

if [ $STAGE -le 4 ]
then
mkdir -p $WORKDIR/musl
cd $WORKDIR/musl
git init -q
git fetch -q https://github.com/dcodeIO/webassembly.git
git checkout -f -q $WEBASSEMBLY_COMMIT
git submodule update -q --init --recursive -- lib/musl
# this rebuilding shouldn't be necessary, but for some reason it is...
npm install -q
node lib/build.js
fi
