FROM trzeci/emscripten:1.39.18-upstream

RUN apt-get update
RUN apt-get install gperf
