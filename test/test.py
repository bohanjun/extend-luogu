#!/usr/bin/env python3

from playwright.sync_api import sync_playwright

path_to_extension = "./test/tampermonkey"
user_data_dir = "./tmp"


def run(playwright):
    context = playwright.chromium.launch_persistent_context(
        user_data_dir,
        headless=False,
        args=[
            f"--disable-extensions-except={path_to_extension}",
            f"--load-extension={path_to_extension}",
        ],
    )
    page = context.new_page()
    page.goto("http://playwright.dev")
    print(page.title())
    context.close()


with sync_playwright() as playwright:
    run(playwright)