#!/bin/bash

# Tự động đồng bộ GitHub (Pull và Push)
while true; do
  git pull origin $(git rev-parse --abbrev-ref HEAD) || true
  git add .
  git commit -m "Auto-sync changes from Codespaces" || true
  git push origin $(git rev-parse --abbrev-ref HEAD) || true
  sleep 60
done
