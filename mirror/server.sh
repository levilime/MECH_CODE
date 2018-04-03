#!/bin/bash

TIMEOUT=$2
for((count=$1,port=3000;count>0;--count,port+=1)); do
    node src/main.js $port $TIMEOUT &
done