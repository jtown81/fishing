#!/bin/bash

# Git Branch Manager Script
# Provides interactive menu for committing, pushing, and managing master/develop branches

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

check_git_repo() {
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository"
    exit 1
  fi
}

get_current_branch() {
  git rev-parse --abbrev-ref HEAD
}

show_status() {
  print_header "Current Status"
  echo "Branch: $(get_current_branch)"
  echo "Changes:"
  git status -s || echo "  (clean)"
}

# Main menu actions
commit_changes() {
  print_header "Commit Changes"

  if [[ -z $(git status -s) ]]; then
    print_info "No changes to commit"
    return
  fi

  git status -s
  echo
  read -p "Enter commit message: " message

  if [[ -z "$message" ]]; then
    print_error "Commit message cannot be empty"
    return
  fi

  git add -A
  git commit -m "$message"
  print_success "Changes committed"
}

push_to_remote() {
  print_header "Push to Remote"

  branch=$(get_current_branch)
  echo "Current branch: $branch"

  read -p "Push to remote? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin "$branch"
    print_success "Pushed to origin/$branch"
  else
    print_info "Push cancelled"
  fi
}

switch_branch() {
  print_header "Switch Branch"

  echo "Available branches:"
  git branch -a | sed 's/^/  /'
  echo
  read -p "Enter branch name to switch to: " branch

  if [[ -z "$branch" ]]; then
    print_error "Branch name cannot be empty"
    return
  fi

  if git rev-parse --verify "$branch" > /dev/null 2>&1; then
    git checkout "$branch"
    print_success "Switched to $branch"
  else
    print_error "Branch '$branch' not found"
  fi
}

create_branch() {
  print_header "Create New Branch"

  read -p "Enter new branch name: " branch

  if [[ -z "$branch" ]]; then
    print_error "Branch name cannot be empty"
    return
  fi

  if git rev-parse --verify "$branch" > /dev/null 2>&1; then
    print_error "Branch '$branch' already exists"
    return
  fi

  git checkout -b "$branch"
  print_success "Created and switched to $branch"
}

delete_branch() {
  print_header "Delete Branch"

  current=$(get_current_branch)
  echo "Current branch: $current"
  echo
  echo "Available branches (excluding current):"
  git branch | grep -v "^\*" | sed 's/^/  /'
  echo
  read -p "Enter branch name to delete: " branch

  if [[ -z "$branch" ]]; then
    print_error "Branch name cannot be empty"
    return
  fi

  if [[ "$branch" == "$current" ]]; then
    print_error "Cannot delete current branch"
    return
  fi

  read -p "Delete remote branch too? (y/n) " -n 1 -r
  echo

  git branch -d "$branch"
  print_success "Deleted local branch: $branch"

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin --delete "$branch"
    print_success "Deleted remote branch: origin/$branch"
  fi
}

merge_branches() {
  print_header "Merge Branches"

  current=$(get_current_branch)
  echo "Current branch: $current"
  echo

  read -p "Enter branch to merge into current: " source_branch

  if [[ -z "$source_branch" ]]; then
    print_error "Branch name cannot be empty"
    return
  fi

  if ! git rev-parse --verify "$source_branch" > /dev/null 2>&1; then
    print_error "Branch '$source_branch' not found"
    return
  fi

  if [[ "$source_branch" == "$current" ]]; then
    print_error "Cannot merge branch into itself"
    return
  fi

  git merge "$source_branch"
  print_success "Merged $source_branch into $current"
}

pull_from_remote() {
  print_header "Pull from Remote"

  branch=$(get_current_branch)
  echo "Current branch: $branch"
  echo

  read -p "Pull latest changes? (y/n) " -n 1 -r
  echo

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git pull origin "$branch"
    print_success "Pulled latest changes"
  else
    print_info "Pull cancelled"
  fi
}

view_log() {
  print_header "Commit Log"

  read -p "Number of commits to show (default: 10): " count
  count=${count:-10}

  git log --oneline -n "$count"
}

stash_changes() {
  print_header "Stash Changes"

  if [[ -z $(git status -s) ]]; then
    print_info "No changes to stash"
    return
  fi

  read -p "Stash message (optional): " message

  if [[ -z "$message" ]]; then
    git stash
  else
    git stash push -m "$message"
  fi

  print_success "Changes stashed"
}

# Main menu
show_menu() {
  print_header "Git Branch Manager"
  echo "Current branch: $(get_current_branch)"
  echo
  echo "1) Show status"
  echo "2) Commit changes"
  echo "3) Push to remote"
  echo "4) Pull from remote"
  echo "5) Switch branch"
  echo "6) Create branch"
  echo "7) Delete branch"
  echo "8) Merge branches"
  echo "9) View commit log"
  echo "10) Stash changes"
  echo "0) Exit"
  echo
}

main() {
  check_git_repo

  while true; do
    show_menu
    read -p "Choose an option: " choice

    case $choice in
      1) show_status ;;
      2) commit_changes ;;
      3) push_to_remote ;;
      4) pull_from_remote ;;
      5) switch_branch ;;
      6) create_branch ;;
      7) delete_branch ;;
      8) merge_branches ;;
      9) view_log ;;
      10) stash_changes ;;
      0) print_success "Goodbye!"; exit 0 ;;
      *) print_error "Invalid option" ;;
    esac

    read -p "Press Enter to continue..."
  done
}

main "$@"
