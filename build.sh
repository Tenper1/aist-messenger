#!/bin/bash
set -e
npm install --legacy-peer-deps
CI=false npm run build
