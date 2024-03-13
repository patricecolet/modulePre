#!/bin/bash

test=`python3 -c 'from time import time;print(int(round(time() * 1000)))'`

echo _$test
