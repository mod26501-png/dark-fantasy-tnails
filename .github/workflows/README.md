# 🔥 Firebase CI/CD Pipeline Setup

This repository includes an automated GitHub Actions CI/CD workflow (`.github/workflows/firebase-ci-cd.yml`) that triggers on every push and pull request to the `main` branch.

### 📋 What It Does:
1. **Build & Verify**:
   - Tests compilation of both the frontend (Vite) and backend (Express server).
   - Validates `firestore.rules` syntax against the Firebase schema.
2. **Automated Deployment**:
   - Deploys updated security rules and hosting to Firebase Project `ai-studio-demoncodexdarkfa-a22713ae-9899-4eb9-b831-880b3a832015`.

### 🔑 GitHub Secrets Configuration:
In your GitHub repository, navigate to **Settings > Secrets and variables > Actions** and add:

- `FIREBASE_SERVICE_ACCOUNT`: The JSON content of your Firebase service account key (recommended).
- OR `FIREBASE_TOKEN`: A CI token generated via `npx firebase-tools login:ci`.
