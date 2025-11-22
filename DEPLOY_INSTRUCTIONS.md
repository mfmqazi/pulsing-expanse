# How to Deploy to GitHub Pages

I have prepared your project for deployment! Since I cannot access your GitHub account directly, you need to follow these simple steps to publish your app.

## Prerequisites
- You must have a GitHub account.
- You must have `git` installed (which you do).

## Steps

1.  **Create a New Repository on GitHub**
    *   Go to [GitHub.com](https://github.com) and sign in.
    *   Click the **+** icon in the top right and select **New repository**.
    *   Name the repository **pulsing-expanse** (This is important because the configuration is set for this name).
    *   Make sure it is **Public** (GitHub Pages is free for public repos).
    *   Do **not** initialize with README, .gitignore, or License (we already have code).
    *   Click **Create repository**.

2.  **Connect Your Local Code to GitHub**
    *   Copy the commands under "…or push an existing repository from the command line". They will look like this:
        ```bash
        git remote add origin https://github.com/<YOUR_USERNAME>/pulsing-expanse.git
        git branch -M main
        git push -u origin main
        ```
    *   Run these commands in your terminal (VS Code terminal is fine).

3.  **Deploy the App**
    *   Once the code is pushed, run this command in your terminal:
        ```bash
        npm run deploy
        ```
    *   This script will build your app and push it to a `gh-pages` branch.

4.  **View Your Live App**
    *   After a minute or two, your app will be live at:
        `https://<YOUR_USERNAME>.github.io/pulsing-expanse/`
    *   You can also find this link in your GitHub repo under **Settings > Pages**.

## Troubleshooting
- If you see a blank page, make sure your repository name is exactly `pulsing-expanse`. If you named it something else, you need to update `vite.config.js` to match: `base: '/<YOUR_REPO_NAME>/'`.
