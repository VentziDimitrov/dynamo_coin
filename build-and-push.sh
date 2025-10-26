#!/bin/bash

# Build and Push Docker Images to Docker Hub
# Usage: ./build-and-push.sh [version]
# Example: ./build-and-push.sh 1.0

set -e  # Exit on error

# Configuration
DOCKER_USERNAME="ventzidimitrov"
DOCKER_REPO="dynamo_coin"
VERSION=${1:-"1.0"}

echo "================================"
echo "Building Dynamo Coin Docker Images"
echo "================================"
echo "Docker Username: $DOCKER_USERNAME"
echo "Repository: $DOCKER_REPO"
echo "Version: $VERSION"
echo ""

# Check if logged in to Docker Hub
echo "Checking Docker Hub login..."
if ! docker info | grep -q "Username: $DOCKER_USERNAME"; then
    echo "Please login to Docker Hub first:"
    docker login
fi

echo ""
echo "Step 1: Building Backend Image..."
echo "--------------------------------"
docker build \
    -t $DOCKER_USERNAME/$DOCKER_REPO:backend-latest \
    -t $DOCKER_USERNAME/$DOCKER_REPO:backend-$VERSION \
    ./dynamo_coin_backend

echo ""
echo "Step 2: Building Frontend Image..."
echo "--------------------------------"
docker build \
    -t $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest \
    -t $DOCKER_USERNAME/$DOCKER_REPO:frontend-$VERSION \
    ./dynamo_coin_portfolio

echo ""
echo "Step 3: Pushing Backend Images to Docker Hub..."
echo "-----------------------------------------------"
docker push $DOCKER_USERNAME/$DOCKER_REPO:backend-latest
docker push $DOCKER_USERNAME/$DOCKER_REPO:backend-$VERSION

echo ""
echo "Step 4: Pushing Frontend Images to Docker Hub..."
echo "------------------------------------------------"
docker push $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest
docker push $DOCKER_USERNAME/$DOCKER_REPO:frontend-$VERSION

echo ""
echo "================================"
echo "SUCCESS! Images pushed to Docker Hub"
echo "================================"
echo ""
echo "Backend Images:"
echo "  - $DOCKER_USERNAME/$DOCKER_REPO:backend-latest"
echo "  - $DOCKER_USERNAME/$DOCKER_REPO:backend-$VERSION"
echo ""
echo "Frontend Images:"
echo "  - $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest"
echo "  - $DOCKER_USERNAME/$DOCKER_REPO:frontend-$VERSION"
echo ""
echo "View at: https://hub.docker.com/r/$DOCKER_USERNAME/$DOCKER_REPO"
echo ""
echo "To use in production, run:"
echo "  docker-compose -f docker-compose.prod.yml up -d"
echo ""
