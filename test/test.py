#!/usr/bin/env python3

from playwright.sync_api import sync_playwright
import sys

path_to_extension = "./test/tampermonkey"
user_data_dir = "./tmp"
script_dir = f"{sys.argv[1]}/"

def install(context):
    page = context.new_page()
    page.goto(f"file://{script_dir}")
    print(page.title())

def run(playwright):
    context = playwright.chromium.launch_persistent_context(
        user_data_dir,
        headless=False,
        args=[
            f"--disable-extensions-except={path_to_extension}",
            f"--load-extension={path_to_extension}",
        ],
    )
    install(context)
    context.close()


with sync_playwright() as playwright:
    run(playwright)