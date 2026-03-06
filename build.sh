#!/bin/bash

# Interactive build script for Fishing Tournament App
# Prompts user for build scenario and executes appropriate commands

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "================================"
echo "Fishing Tournament App Build Tool"
echo "================================"
echo ""

# Display menu
show_menu() {
    echo "Select a build scenario:"
    echo ""
    echo "  1) Development Server (with hot reload)"
    echo "  2) Production Build Only"
    echo "  3) Production Build + Preview"
    echo "  4) Run All Tests"
    echo "  5) Run Tests (watch mode)"
    echo "  6) Type Check"
    echo "  7) Clean Build (delete dist/ and rebuild)"
    echo "  8) Full Build Pipeline (test + typecheck + build)"
    echo "  9) Full Build Pipeline + Start Server"
    echo " 10) Dev Server + Seed Test Data"
    echo " 11) Kill Running Dev/Preview Servers"
    echo ""
    read -p "Enter your choice (1-11): " choice
}

# Function to run dev server
run_dev() {
    echo ""
    echo "Starting development server on port 4444..."
    echo "Visit: http://localhost:4444"
    echo ""
    pnpm dev
}

# Function to build production
run_build() {
    echo ""
    echo "Building for production..."
    pnpm build
    echo ""
    echo "✓ Production build complete!"
    echo "  Output directory: dist/"
}

# Function to build and preview
run_build_and_preview() {
    echo ""
    echo "Building for production..."
    pnpm build
    echo "✓ Production build complete!"
    echo ""
    echo "Starting preview server on port 4444..."
    echo "Visit: http://localhost:4444"
    echo ""
    pnpm preview
}

# Function to run all tests
run_tests() {
    echo ""
    echo "Running all tests..."
    pnpm test
    echo ""
    echo "✓ All tests passed!"
}

# Function to run tests in watch mode
run_tests_watch() {
    echo ""
    echo "Running tests in watch mode..."
    echo "Press Ctrl+C to exit"
    echo ""
    pnpm test:watch
}

# Function to typecheck
run_typecheck() {
    echo ""
    echo "Running TypeScript type check..."
    pnpm typecheck
    echo ""
    echo "✓ Type check passed!"
}

# Function to clean and rebuild
run_clean_build() {
    echo ""
    echo "Cleaning dist/ directory..."
    rm -rf dist/
    echo "✓ Cleaned"
    echo ""
    echo "Building for production..."
    pnpm build
    echo ""
    echo "✓ Clean production build complete!"
}

# Function to run full pipeline
run_full_pipeline() {
    echo ""
    echo "Starting full build pipeline..."
    echo ""

    echo "[1/3] Running tests..."
    pnpm test
    echo "✓ Tests passed"
    echo ""

    echo "[2/3] Type checking..."
    pnpm typecheck
    echo "✓ Type check passed"
    echo ""

    echo "[3/3] Building for production..."
    pnpm build
    echo "✓ Production build complete"
    echo ""

    echo "================================"
    echo "✓ Full build pipeline complete!"
    echo "================================"
    echo "Output directory: dist/"
}

# Function to run full pipeline and start server
run_full_pipeline_and_serve() {
    run_full_pipeline
    echo ""
    echo "Starting preview server on port 4444..."
    echo "Visit: http://localhost:4444"
    echo ""
    pnpm preview
}

# Function to kill running vite dev/preview servers
kill_servers() {
    echo ""
    echo "Looking for running Vite servers..."
    local pids
    pids=$(pgrep -f "vite" 2>/dev/null)
    if [ -z "$pids" ]; then
        echo "No running Vite servers found."
    else
        echo "Found PIDs: $pids"
        kill $pids 2>/dev/null && echo "✓ Servers killed." || echo "⚠️  Some processes could not be killed (may need sudo)."
    fi
}

# Function to run dev server and auto-seed via ?seed URL param
run_dev_with_seed() {
    local port=4444
    echo ""
    echo "Starting development server..."
    echo ""
    echo "┌──────────────────────────────────────────────────────────┐"
    echo "│  Open this URL to auto-seed 7 tournaments (2016-2022):   │"
    echo "│                                                          │"
    echo "│    http://localhost:$port/?seed                           │"
    echo "│                                                          │"
    echo "│  The app will seed then reload automatically.            │"
    echo "└──────────────────────────────────────────────────────────┘"
    echo ""
    pnpm dev
}

# Main logic
show_menu

case $choice in
    1)
        run_dev
        ;;
    2)
        run_build
        ;;
    3)
        run_build_and_preview
        ;;
    4)
        run_tests
        ;;
    5)
        run_tests_watch
        ;;
    6)
        run_typecheck
        ;;
    7)
        run_clean_build
        ;;
    8)
        run_full_pipeline
        ;;
    9)
        run_full_pipeline_and_serve
        ;;
    10)
        run_dev_with_seed
        ;;
    11)
        kill_servers
        ;;
    *)
        echo "Invalid choice. Please enter a number between 1-11."
        exit 1
        ;;
esac

echo ""
echo "Done!"
