#!/bin/bash

# Đồng bộ tự động với GitHub
while true; do
  git add .
  git commit -m "Auto-sync changes from Codespaces" || true
  git push origin $(git rev-parse --abbrev-ref HEAD) || true
  sleep 60 # Đồng bộ mỗi 60 giây
done
