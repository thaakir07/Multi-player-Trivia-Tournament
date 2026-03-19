#!/bin/bash
set -e

# Open first npm dev in new terminal
gnome-terminal -- bash -c "npm run dev"

# Open second npm dev in new terminal
gnome-terminal -- bash -c "cd server && npm run dev"

# Wait a few seconds for both servers to start
sleep 2

# Run PostgreSQL command in the second folder
cd server
psql "postgresql://group6db_user:YGDSEtxVVE3kTh1c463xhfgf24CoweQb@dpg-d3e11vidbo4c738vjpg0-a.oregon-postgres.render.com/group6db"

