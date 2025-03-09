#!/bin/bash

echo "Checking if feature app is accessible..."
curl -I http://localhost:5001/assets/assets/remoteEntry.js

if [ $? -eq 0 ]; then
  echo "Feature app is accessible!"
else
  echo "Feature app is NOT accessible!"
fi 