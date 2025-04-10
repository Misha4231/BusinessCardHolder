#!/bin/sh
set -e

echo "Wait for database"
sleep 10

echo "Starting server..."
exec "$@"