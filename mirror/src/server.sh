#!/bin/bash

TIMEOUT=$2
for((count=$1,port=3000;count>0;--count,port+=10)); do
    node main.js $port $TIMEOUT &
done