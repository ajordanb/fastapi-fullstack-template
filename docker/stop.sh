#!/bin/bash
echo "Stopping and removing all containers, networks, and volumes..."
docker compose down -v --remove-orphans