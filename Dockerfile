FROM trzeci/emscripten:sdk-tag-1.37.27-64bit

RUN apt-get update
RUN apt-get install gperf
