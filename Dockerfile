FROM trzeci/emscripten:sdk-tag-1.38.21-64bit

RUN apt-get update
RUN apt-get install gperf
