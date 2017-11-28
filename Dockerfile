FROM trzeci/emscripten-slim:sdk-tag-1.37.23-64bit

RUN apt-get update
RUN apt-get install gperf
