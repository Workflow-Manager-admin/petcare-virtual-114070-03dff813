#!/bin/bash
cd /home/kavia/workspace/code-generation/petcare-virtual-114070-03dff813/virtual_pet_game_frontend_workspace/virtual_pet_game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

