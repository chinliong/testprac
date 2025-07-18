# GitHub Actions + SonarCloud Quick Setup

## 🚀 Quick Setup Steps

### 1. SonarCloud Setup

1. Go to [sonarcloud.io](https://sonarcloud.io/)
2. Sign in with GitHub
3. Import repository: `chinliong/testprac`
4. Choose **CI-based analysis** (not automatic)

### 2. Get SonarCloud Token

1. SonarCloud → My Account → Security
2. Generate new token: "GitHub Actions"
3. Copy token (starts with `squ_`)

### 3. Add GitHub Secret

1. GitHub repo → Settings → Secrets and variables → Actions
2. New repository secret:
   - Name: `SONAR_TOKEN`
   - Value: `squ_xxxxxxxxxxxxxxxxx` (your token)

### 4. Push to Trigger

```bash
git add .
git commit -m "Add SonarCloud integration"
git push origin main
```

## ✅ Verification

- Check GitHub Actions tab for workflow run
- Look for "SonarCloud Scan" step
- View results in SonarCloud dashboard

## 🔧 Current Configuration

- **Workflow**: `.github/workflows/ci-cd.yml`
- **SonarCloud Action**: `SonarSource/sonarcloud-github-action@v2.3.0`
- **Project Key**: `chinliong_testprac`
- **Organization**: `chinliong`

## 🐛 If It Fails

1. Check SONAR_TOKEN is set correctly
2. Verify project exists in SonarCloud
3. Ensure repository is imported in SonarCloud
4. Check GitHub Actions logs for specific errors

## 📊 Results Location

- **SonarCloud**: https://sonarcloud.io/project/overview?id=chinliong_testprac
- **GitHub**: Actions tab → Latest workflow run
