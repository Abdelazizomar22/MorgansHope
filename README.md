# 🤝 Contributing to Morgan's Hope

Welcome to the Morgan's Hope project. This guide explains how each team member should set up their environment and safely push work. Please read it fully before touching anything.

---

Each team works **only inside their folder**, on **their own branch**. Do not touch other folders.

> ⚠️ **Never push directly to `main`.** Only the project owner merges into `main` via Pull Requests.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd MorgansHope
```

### 2. Switch to your branch

```bash
# Frontend team
git checkout abdelaziz/feat-frontend

# Backend team
git checkout abdelaziz/feat-backend

# AI team
git checkout abdelaziz/feat-ai
```

### 3. Confirm you're on the right branch

```bash
git branch
# The active branch will have a * next to it
```

---

## 📅 Daily Workflow

Follow these steps every time you want to push your work.

### Step 1 — Pull the latest changes first

```bash
git pull origin <your-branch>
```

Always do this before starting to avoid conflicts.

### Step 2 — Do your work inside your folder only

Make sure all your files are inside your designated folder, such as `frontend/`, `backend/`, or `ai/`. Do not create files at the root level or inside another team's folder.

### Step 3 — Push your changes

```bash
git add .
git commit -m "feat: short description of what you did"
git push origin <your-branch>
```

---

## 🔁 Requesting a Merge into Main

When your work is ready and tested:

1. Go to the repo on GitHub.
2. Open **Pull Requests** → **New Pull Request**.
3. Set **base:** `main` and **compare:** your branch.
4. Write a short description of what's included.
5. Submit the Pull Request for review.

---

## ⚠️ Golden Rules

- Always work on your branch only.
- Always pull before starting.
- Only push files inside your folder.
- Never push to `main`.
- Never edit another team's folder.
- Never force push unless the project owner explicitly asks for it.

---

## 🆘 Common Issues

**"I have a merge conflict"**

```bash
git pull origin <your-branch>
# Resolve the conflicting files manually, then:
git add .
git commit -m "fix: resolve merge conflict"
git push origin <your-branch>
```

**"I made changes but forgot to pull first"**

```bash
git stash
git pull origin <your-branch>
git stash pop
```

---

## 📬 Questions?

Reach out to **Abdelaziz**.
