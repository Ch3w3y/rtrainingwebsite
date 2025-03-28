#!/usr/bin/env python3

import os
import re
import shutil
import sys

# --- Configuration ---
TARGET_FILE = "tidyverse.html"
CONTAINER_CLASS = "container"
BACKUP_DIR = "backup_direct_container" # New backup dir name
# --- End Configuration ---

def ensure_dir(dir_path):
    """Creates a directory if it doesn't exist."""
    if not os.path.exists(dir_path):
        print(f"Creating directory '{dir_path}'...")
        try:
            os.makedirs(dir_path)
        except OSError as e:
            print(f"ERROR: Failed to create directory '{dir_path}': {e}", file=sys.stderr)
            return False
    return True

def wrap_content(match_obj, class_name, base_indent_str):
    """Helper function for re.sub to wrap matched content."""
    # Group 1: Opening tag (e.g., </header> or <footer>)
    # Group 2: Content to wrap
    # Group 3: Closing tag (e.g., <footer> or </footer>)
    content_to_wrap = match_obj.group(2)
    # Add indentation for the container div itself
    container_indent = base_indent_str
    # Add more indentation for the content inside the container
    content_indent = base_indent_str + '  '

    # Indent the actual content lines
    content_lines = content_to_wrap.strip().splitlines()
    indented_content = "\n".join([f"{content_indent}{line}" for line in content_lines])

    # Return the original tags with the wrapped content in between
    return (match_obj.group(1) +
            f"\n{container_indent}<div class=\"{class_name}\">\n{indented_content}\n{container_indent}</div>\n{container_indent}" +
            match_obj.group(3))

# --- Main Execution ---
if __name__ == "__main__":
    print(f"Starting direct container div insertion for '{TARGET_FILE}'...")

    if not ensure_dir(BACKUP_DIR):
        sys.exit(1)

    # Check if the target file exists
    if not os.path.exists(TARGET_FILE):
        print(f"ERROR: Target file '{TARGET_FILE}' not found. Exiting.", file=sys.stderr)
        sys.exit(1)

    basename = os.path.basename(TARGET_FILE)
    backup_filepath = os.path.join(BACKUP_DIR, basename)

    # --- Backup Original File ---
    try:
        print(f"  Backing up '{basename}' to '{BACKUP_DIR}/'...")
        shutil.copy2(TARGET_FILE, backup_filepath)
    except Exception as e:
        print(f"ERROR: Failed to back up '{basename}': {e}. Aborting.", file=sys.stderr)
        sys.exit(1)
    # --- End Backup ---

    try:
        print(f"  Processing '{TARGET_FILE}'...")
        with open(TARGET_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content # Keep for comparison
        processed_content = content

        # --- Wrap Main Content using re.sub with a function ---
        # Find indentation of the line *after* </header>
        indent_match_main = re.search(r'</header>\s*\n([ \t]*)', processed_content, flags=re.IGNORECASE)
        main_indent = indent_match_main.group(1) if indent_match_main else '  ' # Default indent

        # Use lambda with captured indent in the replacement function
        processed_content = re.sub(
            r'(</header>)(.*?)(<footer>)',
            lambda m: wrap_content(m, CONTAINER_CLASS, main_indent),
            processed_content,
            count=1, # Only replace the first occurrence
            flags=re.DOTALL | re.IGNORECASE
        )
        print("  Attempted main content wrap.")

        # --- Wrap Footer Content using re.sub with a function ---
         # Find indentation of the <footer> line
        indent_match_footer = re.search(r'^([ \t]*)<footer', processed_content, flags=re.MULTILINE | re.IGNORECASE)
        footer_indent = indent_match_footer.group(1) if indent_match_footer else '' # Default indent

        # Use lambda with captured indent in the replacement function
        processed_content = re.sub(
            r'(<footer.*?>)(.*?)(</footer>)',
            lambda m: wrap_content(m, CONTAINER_CLASS, footer_indent + '  '), # Indent footer content further
            processed_content,
            count=1, # Only replace the first occurrence
            flags=re.DOTALL | re.IGNORECASE
        )
        print("  Attempted footer content wrap.")


        # --- Write Modified Content ---
        if processed_content != original_content:
            print(f"  Writing changes to '{TARGET_FILE}'...")
            with open(TARGET_FILE, 'w', encoding='utf-8') as f:
                f.write(processed_content)
            print(f"  Successfully updated '{TARGET_FILE}'.")
        else:
             print(f"  No changes detected after wrapping attempts for '{TARGET_FILE}'. File not overwritten.")


    except Exception as e:
        print(f"ERROR: An unexpected error occurred processing '{basename}': {e}", file=sys.stderr)
        # Restore from backup
        try:
            print(f"  Attempting to restore '{basename}' from backup...")
            shutil.copy2(backup_filepath, TARGET_FILE) # Restore original
        except Exception as restore_e:
            print(f"  ERROR: Failed to restore from backup: {restore_e}", file=sys.stderr)
        sys.exit(1) # Exit after error

    print("-" * 40)
    print("Container wrapping process finished.")

