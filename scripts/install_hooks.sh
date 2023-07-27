#!/bin/sh

set -e

GIT_DIR=$(git rev-parse --git-dir)

cp ./hooks/** ${GIT_DIR}/hooks/
