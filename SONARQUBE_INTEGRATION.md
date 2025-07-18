# SonarQube Integration with GitHub Actions

This guide explains how to integrate SonarQube with GitHub Actions for automated code quality analysis.

## Three Integration Options

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

### Option 2: Manual Local Analysis

For running SonarQube analysis manually on your local machine without GitHub Actions.

### Option 3: Self-Hosted Runner 🏠

Use a self-hosted GitHub Actions runner on your machine for automated analysis with your local SonarQube instance.

**Key Benefits:**
- The runner runs on your machine
- Can access localhost:9000 directly
- Automated CI/CD with your local SonarQube instance

#### Setup Steps:

1. **Setup Self-Hosted GitHub Runner**

   - Go to your GitHub repository → Settings → Actions → Runners
   - Click "New self-hosted runner"
   - Follow the instructions to download and configure the runner on your machine:

   ```bash
   # Example commands (follow the exact instructions from GitHub)
   mkdir actions-runner && cd actions-runner
   curl -o actions-runner-osx-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-osx-x64-2.311.0.tar.gz
   tar xzf ./actions-runner-osx-x64-2.311.0.tar.gz
   ./config.sh --url https://github.com/chinliong/testprac --token YOUR_REGISTRATION_TOKEN
   ./run.sh
   ```

2. **Start Your Local SonarQube**

   ```bash
   # Make sure SonarQube is running on localhost:9000
   docker-compose up -d
   ```

3. **Get SonarQube Token**

   - Access your local SonarQube: http://localhost:9000
   - Login with admin/admin (default credentials)
   - Go to My Account → Security → Generate Token
   - Copy the token

4. **Add GitHub Secrets**

   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `SONAR_TOKEN_LOCAL`: Your local SonarQube token (different from SonarCloud token)

5. **Use the Self-Hosted Workflow**

   - The workflow in `.github/workflows/sonarqube-local.yml` needs to be updated to use `SONAR_TOKEN_LOCAL`
   - It uses `runs-on: self-hosted` to run on your machine
   - Manually trigger it via Actions tab or push to main/develop branch

6. **Workflow Features**
   - ✅ Runs on your machine with access to localhost:9000
   - ✅ Automated test execution with coverage
   - ✅ SonarQube scanner integration
   - ✅ Real-time analysis results in your local SonarQube instance

### Option 2: Manual Local Analysis

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

For **SonarCloud** (Option 1 - GitHub integration):

1. Sign up at https://sonarcloud.io
2. Import your repository
3. Add `SONAR_TOKEN` to GitHub secrets
4. Push to trigger analysis

For **Manual Local Development** (Option 2):

1. Run `./run-sonar-analysis.sh`
2. View results at http://localhost:9000

For **Self-Hosted Runner** (Option 3 - Automated local analysis):

1. Setup self-hosted GitHub runner on your machine
2. Add `SONAR_TOKEN_LOCAL` to GitHub secrets (from local SonarQube)
3. Trigger `.github/workflows/sonarqube-local.yml` workflow
4. View results at http://localhost:9000

Choose SonarCloud (Option 1 - recommended), manual local analysis (Option 2), or self-hosted runner (Option 3) for continuous integration.
