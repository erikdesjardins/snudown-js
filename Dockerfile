FROM trzeci/emscripten:sdk-tag-1.39.3-64bit

RUN apt-get update
RUN apt-get install gperf
