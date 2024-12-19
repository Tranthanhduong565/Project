#!/bin/bash

# Tự động đồng bộ GitHub (Pull và Push)
while true; do
  git pull origin $(git rev-parse --abbrev-ref HEAD) || true
  git add .
  git commit -m "Auto-sync changes from Codespaces" || true

  # Push các thay đổi và kiểm tra trạng thái push
  if git push origin $(git rev-parse --abbrev-ref HEAD); then
    echo "Push successful"
  else
    echo "Push failed"
  fi

  sleep 60
done
