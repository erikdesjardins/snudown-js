FROM trzeci/emscripten-slim:sdk-tag-1.37.22-64bit

RUN apt-get update
RUN apt-get install gperf
