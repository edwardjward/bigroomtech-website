# Big Room Tech Website — Setup Guide

**Monthly cost: $0** (replaces your $35/month Webflow plan)

---

## STEP 1 — Upload to GitHub (5 minutes)

You need a free GitHub account to store your website files. The CMS reads and writes to GitHub.

1. Go to **https://github.com** and create a free account
2. Click the **+** button (top right) → **New repository**
3. Name it `bigroomtech-website`, make it **Private**, click **Create repository**
4. On the next page, click **uploading an existing file**
5. Unzip the file I gave you and drag ALL the files into the GitHub upload box
6. Click **Commit changes**

---

## STEP 2 — Deploy to Netlify (5 minutes)

1. Go to **https://netlify.com** and create a free account (use "Sign up with GitHub")
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** → find and select `bigroomtech-website`
4. Leave all settings as default, click **Deploy site**
5. Your site will be live in ~60 seconds at a URL like `random-name.netlify.app`

**Connect your domain (bigroomtech.com):**
- In Netlify: go to **Site settings → Domain management → Add custom domain**
- Type `bigroomtech.com` and follow the instructions
- Netlify will tell you exactly which DNS records to update at your domain registrar
- Takes 5–30 minutes to go live. Netlify handles HTTPS/SSL automatically (free).

---

## STEP 3 — Enable the Blog CMS (5 minutes)

This gives you a visual dashboard to write blog posts — no code needed.

**Enable Netlify Identity:**
1. In your Netlify dashboard, go to **Site settings → Identity**
2. Click **Enable Identity**
3. Scroll to **Registration preferences** → set to **Invite only** (so only you can log in)
4. Scroll to **Services → Git Gateway** → click **Enable Git Gateway**

**Create your login:**
1. Still in Identity settings, click **Invite users**
2. Enter your email address and click **Send**
3. Check your email and click the invite link
4. Set your password

**Access the CMS:**
- Go to `https://yoursite.com/admin`
- Log in with the email and password you just set
- You'll see a dashboard where you can write and publish blog posts

---

## STEP 4 — Write Your First Blog Post

1. Go to `https://yoursite.com/admin`
2. Click **New Blog Posts**
3. Fill in: Title, Date, Category, Excerpt (short summary), Cover Image URL, and Body text
4. For images, go to **https://unsplash.com**, find a photo, right-click → Copy image address, paste the URL
5. Click **Publish** when ready

⚠️ **One extra step after publishing:** Each new post needs to be added to `blogs-data/manifest.json` in GitHub. This tells the website the post exists. Add the filename like this:

```json
{
  "posts": [
    "my-new-post-title.md",
    "how-early-stage-startups-should-think-about-ai-in-2025.md"
  ]
}
```

The filename will match whatever slug the CMS created (you can find it in GitHub under `blogs-data/`).

> **Note:** If you want to avoid this step entirely, ask me to set up a Netlify serverless function that auto-updates the manifest — I can do that in a follow-up.

---

## Contact Form

The contact form on your site uses **Netlify Forms**, which is free for up to 100 submissions/month. Submissions appear in your Netlify dashboard under **Forms**. You can also set up email notifications in Netlify → **Site settings → Forms → Email notifications**.

---

## Summary of Free Tools Used

| What | Tool | Cost |
|------|------|------|
| Hosting | Netlify Free | $0 |
| Domain | Your existing domain | Already paid |
| SSL/HTTPS | Netlify (auto) | $0 |
| Blog CMS | Decap CMS + Netlify Identity | $0 |
| Contact forms | Netlify Forms | $0 |
| **Total** | | **$0/month** |

Previously: **$35/month on Webflow = $420/year** ✓
