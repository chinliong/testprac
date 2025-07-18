# SonarQube Integration with GitHub Actions

This guide explains how to integrate SonarQube with GitHub Actions for automated code quality analysis.

## Two Integration Options

### Option 1: SonarCloud (Recommended for GitHub Projects)

SonarCloud is the cloud-based version of SonarQube and is **free for public repositories**.

#### Setup Steps:

1. **Sign up for SonarCloud**
   - Go to [https://sonarcloud.io/](https://sonarcloud.io/)
   - Sign in with your GitHub account
   - Import your repository `chinliong/testprac`

2. **Configure SonarCloud Project**
   - Organization key: `chinliong` (your GitHub username)
   - Project key: `chinliong_testprac`
   - Enable automatic analysis or use CI-based analysis (choose CI-based)

3. **Get SonarCloud Token**
   - Go to SonarCloud → My Account → Security
   - Generate a new token named "GitHub Actions"
   - Copy the token value (starts with `squ_`)

4. **Add GitHub Secrets**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `SONAR_TOKEN`: Your SonarCloud token (the one that starts with `squ_`)

5. **Verify Configuration**
   - The `sonar-project.properties` file is already configured correctly
   - The GitHub Actions workflow in `.github/workflows/ci-cd.yml` is ready
   - Push to main/develop branch to trigger analysis

6. **GitHub Actions Integration**
   - The workflow will automatically run SonarCloud analysis on every push/PR
   - Uses `SonarSource/sonarcloud-github-action@v2.3.0`
   - Results will appear in SonarCloud dashboard

### Option 2: Local SonarQube Instance

For using your local SonarQube instance with GitHub Actions (requires self-hosted runner).

#### Setup Steps:

1. **Make SonarQube Accessible**

   - Your SonarQube is running on `http://localhost:9000`
   - For GitHub Actions to access it, you need either:
     - A self-hosted GitHub runner on your machine
     - Or expose SonarQube to the internet (not recommended for development)

2. **Setup Self-Hosted Runner**

   ```bash
   # Download and configure GitHub Actions runner
   # Follow instructions from: GitHub Repository → Settings → Actions → Runners → New self-hosted runner
   ```

3. **Get SonarQube Token**

   - Access your local SonarQube: http://localhost:9000
   - Login with admin/admin (default credentials)
   - Go to My Account → Security → Generate Token
   - Copy the token

4. **Add GitHub Secrets**

   - `SONAR_TOKEN`: Your SonarQube token
   - `SONAR_HOST_URL`: `http://localhost:9000`

5. **Use Local Workflow**
   - Use the workflow in `.github/workflows/sonarqube-local.yml`
   - This requires a self-hosted runner

## Manual Local Analysis (Alternative)

If you don't want to use GitHub Actions, you can run SonarQube analysis manually:

### Install SonarQube Scanner

```bash
# macOS
brew install sonar-scanner

# Or download from: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/
```

### Run Analysis

```bash
# Make sure your SonarQube server is running
docker-compose up -d

# Run tests to generate coverage
npm test -- --coverage

# Option 1: Use the provided script (recommended)
./run-sonar-analysis.sh

# Option 2: Run SonarQube analysis manually
sonar-scanner \
  -Dproject.settings=sonar-project.local.properties \
  -Dsonar.token=YOUR_SONAR_TOKEN
```

## Viewing Results

### SonarCloud

- Results available at: https://sonarcloud.io/project/overview?id=chinliong_testprac

### Local SonarQube

- Results available at: http://localhost:9000
- Login with admin/admin
- Navigate to your project

## Quality Gates

SonarQube can block your CI/CD pipeline if code quality doesn't meet standards:

- **Coverage**: Minimum test coverage percentage
- **Duplicated Code**: Maximum allowed code duplication
- **Maintainability**: Technical debt ratio
- **Reliability**: Bug count thresholds
- **Security**: Security hotspot and vulnerability limits

## Troubleshooting

### Common Issues

1. **"Project not found"**
   - Verify project key matches in sonar-project.properties
   - Check if project exists in SonarQube/SonarCloud

2. **"Unauthorized" / "Failed to query JRE metadata"**
   - Verify SONAR_TOKEN is correctly set in GitHub secrets
   - Check token has project analysis permissions
   - Make sure token starts with `squ_` for SonarCloud

3. **"Connection refused"**
   - For local SonarQube: ensure it's running and accessible
   - For self-hosted runners: verify network connectivity

4. **Coverage not showing**
   - Ensure tests run before SonarQube analysis
   - Verify lcov.info file is generated in coverage/
   - Check sonar.javascript.lcov.reportPaths setting

5. **GitHub Actions: "This action is deprecated"**
   - Updated to use `SonarSource/sonarcloud-github-action@v2.3.0`
   - Avoid using `@master` versions in production

6. **GitHub Actions: "Failed to query server version"**
   - This occurs when using local SonarQube actions for SonarCloud
   - Make sure you're using the correct SonarCloud action
   - Verify your SONAR_TOKEN is for SonarCloud, not local SonarQube

### Best Practices

1. **Always run tests before analysis** to generate coverage reports
2. **Use meaningful project keys** that include organization/username
3. **Set up quality gates** to enforce code quality standards
4. **Monitor technical debt** and address issues regularly
5. **Review security hotspots** and vulnerabilities promptly

## Current Configuration

Your project is configured with:

- ✅ SonarQube latest version (25.7.0+) running locally
- ✅ GitHub Actions workflow ready for SonarCloud
- ✅ Test coverage integration with Jest (94.64% coverage)
- ✅ Proper exclusions for node_modules and test files
- ✅ Security scan integration in CI/CD pipeline
- ✅ Updated GitHub Actions with latest action versions
- ✅ Separate configuration for local vs cloud analysis

### Quick Start

For **SonarCloud** (GitHub integration):

1. Sign up at https://sonarcloud.io
2. Import your repository
3. Add `SONAR_TOKEN` to GitHub secrets
4. Push to trigger analysis

For **Local Development**:

1. Run `./run-sonar-analysis.sh`
2. View results at http://localhost:9000

Choose either SonarCloud (recommended) or local SonarQube with self-hosted runner for continuous integration.
