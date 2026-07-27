# Release & Deployment Workflow

This repository uses GitHub Actions for automated and manual deployments with version management.

## Workflows Overview

### 1. **build.yml** (Reusable Workflow)

- **Purpose**: Common build workflow used by other workflows
- **Triggers**: Called by other workflows
- **Steps**:
  - Checkout code
  - Setup Node.js 20
  - Install dependencies
  - Run linting
  - Build application
  - Upload artifact to GitHub Pages

### 2. **deploy.yml** (Auto Deploy)

- **Purpose**: Automatically deploys to GitHub Pages on push to `main` branch
- **Triggers**:
  - Push to `main` branch
  - Manual trigger via `workflow_dispatch`
- **Flow**: Uses `build.yml` → Deploys to GitHub Pages
- **Version**: Uses current version from `public/version.json`

### 3. **release.yml** (Manual Release & Deploy)

- **Purpose**: Create releases with selectable version increment and deployment
- **Triggers**: Manual trigger via `workflow_dispatch`
- **Input**: Select increment type:
  - `patch` - Bug fixes (0.0.0 → 0.0.1)
  - `minor` - New features (0.0.0 → 0.1.0)
  - `major` - Breaking changes (0.0.0 → 1.0.0)
- **Flow**:
  1. Read current version from `public/version.json`
  2. Increment selected version part automatically
  3. Create release branch (`release/v<auto-version>`)
  4. Update `public/version.json` with new version
  5. Commit version update to release branch
  6. Build application using `build.yml`
  7. Deploy to GitHub Pages
  8. Create GitHub Release with tag `v<auto-version>`

## Version Management

### Version File Location

**File**: `public/version.json`

**Format**:

```json
{
  "version": "v0.0.1",
  "releaseDate": "2026-07-26",
  "releaseBranch": "release/v0.0.1"
}
```

### Displaying Version in Application

The application automatically fetches and displays the version in the GUI:

- Location: Below the main heading
- Displayed as: "Version: **v0.0.1**"
- Fallback: Shows "dev" if version.json is unavailable

### Using Version in Code

```jsx
import { useEffect, useState } from 'react'

function App() {
  const [version, setVersion] = useState('dev')

  useEffect(() => {
    fetch('/version.json')
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => setVersion('dev'))
  }, [])

  return <p>Version: {version}</p>
}
```

## How to Create a Release

### Step 1: Navigate to Workflow

1. Go to **Actions** tab on GitHub
2. Select **"Manual Release & Deploy"** workflow

### Step 2: Trigger Workflow

1. Click **"Run workflow"** button
2. Select increment type:
   - ⚫ **Patch** - Bug fixes (default)
   - ⚪ **Minor** - New features
   - ⚪ **Major** - Breaking changes
3. Click **"Run workflow"**

### Step 3: Monitor Progress

- View workflow execution in real-time
- Shows current version, increment type, and new version
- Deployment completes in ~2-3 minutes
- Release appears under **Releases** tab with git tag

### Step 4: Verify Release

- Check **Releases** page for new auto-generated tag
- Verify `release/v<new-version>` branch was created
- Visit GitHub Pages URL to see deployed version with badge

## Auto-Increment Logic

Select increment type when triggering release:

### Patch (Bug fixes)

```
0.0.0  →  (Patch)  →  0.0.1
0.0.1  →  (Patch)  →  0.0.2
1.2.3  →  (Patch)  →  1.2.4
```

### Minor (New features)

```
0.0.0  →  (Minor)  →  0.1.0
0.1.5  →  (Minor)  →  0.2.0
1.2.3  →  (Minor)  →  1.3.0
```

### Major (Breaking changes)

```
0.0.0  →  (Major)  →  1.0.0
0.5.2  →  (Major)  →  1.0.0
1.2.3  →  (Major)  →  2.0.0
```

**Note**: When incrementing major or minor, patch resets to 0.

## Standard Naming Conventions

### Release Versions

Following **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **Major**: Breaking changes (0 → 1)
- **Minor**: New features (0.0 → 0.1)
- **Patch**: Bug fixes (0.0.0 → 0.0.1)

**Examples**:

```
0.0.1    # Initial release
0.1.0    # First feature release
1.0.0    # Major release
1.0.1    # First patch
1.1.0    # Second feature
2.0.0    # Major version bump
```

### Branch Naming

- **Development**: `main` (default branch)
- **Release**: `release/v<version>` (created automatically)

**Examples**:

```
release/v0.0.1
release/v1.2.3
release/v2.0.0
```

### Git Tags

- Format: `v<version>`
- Created automatically during release workflow
- Used for GitHub Releases

**Examples**:

```
v0.0.1
v1.2.3
v2.0.0
```

## Code Reusability

The workflows are designed to minimize duplication:

- **build.yml**: Reusable workflow containing all build steps
- **deploy.yml**: Uses `build.yml`, adds GitHub Pages deployment
- **release.yml**: Uses `build.yml`, adds version management and release creation

This approach ensures:

- Single source of truth for build logic
- Consistent build process across workflows
- Easy maintenance and updates

## Permissions Required

The workflows require the following GitHub permissions:

- `contents: read` - Read repository content
- `pages: write` - Write to GitHub Pages
- `id-token: write` - For OIDC authentication

For release workflow (additional):

- `contents: write` - Write to repository (create branches/tags)

## Troubleshooting

### Release workflow fails

- Check Node.js version compatibility
- Verify `npm ci` completes successfully
- Check lint errors in `npm run lint`

### Version not displaying

- Verify `public/version.json` exists
- Check browser console for fetch errors
- Try hard refresh (Ctrl+Shift+R)

### Release branch not created

- Ensure release workflow has write permissions
- Check GitHub Actions settings allow branch creation
- Verify version format is correct

## Environment

- **Node.js**: 20.x
- **Package Manager**: npm
- **Build Tool**: Vite
- **Framework**: React 19.2.7
- **Linter**: ESLint
