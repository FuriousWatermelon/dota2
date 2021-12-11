#!/bin/bash

# enviroment
if ! [ -d "venv" ]; then python3 -m venv venv && . venv/bin/activate; fi
if [ "$VIRTUAL_ENV" = "" ]; then . venv/bin/activate; fi

# dependencies
. venv/bin/activate
pip3 install -U pip
pip3 install -r pip/requirements.txt