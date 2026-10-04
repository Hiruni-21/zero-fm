# Hosting Zero FM on Cloudflare

Run everything from your project folder (`zero-fm`), on the `dev` branch.

---

## Step 1: Copy in the latest files

1. Unzip `zero-fm-updates.zip` into your project. Keep the folder paths as they are.
2. Copy the `.github` folder into the root of your project. The path must be exactly `.github/workflows/deploy.yml`.

## Step 2: Check the build

```
npm run build:vinext
```

In the output, check that the route list now has **8** API routes, including `/api/queue`. Your last build listed 7 and no `/api/queue`. Without that route, song requests won't work on the live site.

Then run a local preview and try a song request:

```
npm run start:vinext
```

Open http://localhost:4173, test the site, then press Ctrl + C to stop.

## Step 3: Check .gitignore

Open `.gitignore` and make sure it has these lines. Add any that are missing:

```
node_modules
.next
dist
.wrangler
.dev.vars
.env*
```

## Step 4: Commit and push to GitHub (dev branch)

```
git status
git add -A
git status
```

Read the second `git status` before committing. These new files must be in the list:

- `app/api/queue/route.ts`
- `app/lib/active-section.ts`, `now-playing.ts`, `request-tracks.ts`, `ui-events.ts`
- `app/components/PageEffects.tsx`, `Schedule.tsx`, `CategoryModal.tsx`, `MobileMenu.tsx`
- `.github/workflows/deploy.yml`
- `package.json` and `package-lock.json` (changed by `vinext init`)
- `vite.config.ts`, plus `wrangler.jsonc` if your project has one

Nothing from `node_modules`, `dist` or `.wrangler` should appear.

```
git commit -m "Song requests, interactive UI and Cloudflare deploy setup"
git push -u origin dev
```

The workflow will run on this push and fail, because the Cloudflare secrets aren't added yet. That's expected. Steps 5 to 7 fix it.

## Step 5: First deploy from your laptop (one time only)

Cloudflare preview links only work after the site has been deployed once.

```
npx wrangler login
npm run build:vinext
npx wrangler deploy
```

At the end, wrangler prints your live address, e.g. `https://zero-fm.<your-name>.workers.dev`. Open it and check the site, the player and a song request.

## Step 6: Create a Cloudflare API token

1. Go to https://dash.cloudflare.com, then **My Profile**, **API Tokens**, **Create Token**.
2. Choose the **Edit Cloudflare Workers** template, then **Continue to summary** and **Create Token**.
3. Copy the token. You only see it once.
4. Find your **Account ID**: in the Cloudflare dashboard, open **Workers & Pages**. It's shown on the right side.

## Step 7: Add the secrets to GitHub

In your GitHub repository, go to **Settings**, **Secrets and variables**, **Actions**, **New repository secret**. Add two secrets:

| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | the token from step 6 |
| `CLOUDFLARE_ACCOUNT_ID` | the account ID from step 6 |

Then go to the **Actions** tab, open the failed **Deploy to Cloudflare** run, and click **Re-run all jobs**.

## How it works from now on

- **Push to `dev`:** builds and uploads a **preview**. The live site isn't touched. The preview link is in the run log, under "Upload preview". It looks like `https://dev-zero-fm.<your-name>.workers.dev`.
- **Merge `dev` into `main`:** deploys the **live site**.

To make something live:

```
git checkout main
git pull
git merge dev
git push
git checkout dev
```

You can also open a pull request from `dev` to `main` on GitHub and merge it there.

## If something goes wrong

- **"Authentication error" in Actions:** the token is wrong or missing. Redo steps 6 and 7.
- **"npm ci" fails:** `package-lock.json` wasn't committed or is out of date. Run `npm install`, commit `package-lock.json` and push again.
- **Preview link not shown:** in Cloudflare, open your worker, go to **Settings**, **Domains & Routes**, and make sure **Preview URLs** is enabled.
- **Song requests fail on the live site but work locally:** check that `/api/queue` was in the build output (step 2).
