# Deploy to Google Cloud Run (Frontend + Backend)

This repo now includes Dockerfiles and a GitHub Actions workflow template so you can deploy both the FastAPI backend and the Vite frontend to Google Cloud Run with container images stored in Artifact Registry.

## What’s already set up
- Frontend container: `Dockerfile` at repo root (nginx serves Vite `dist/`).
- Backend container: `server/Dockerfile` (FastAPI + Docling via uvicorn on `$PORT`).
- Docker ignores: `.dockerignore`, `server/.dockerignore`.
- CI template: `.github/workflows/deploy.yml` (manual trigger; switch to push once secrets are in place).

## Prerequisites
1. Google Cloud project with billing enabled.
2. `gcloud` CLI installed and authenticated locally:  
   ```bash
   gcloud auth login
   gcloud config set project <PROJECT_ID>
   ```
3. Enable required APIs (run once):  
   ```bash
   gcloud services enable artifactregistry.googleapis.com run.googleapis.com iamcredentials.googleapis.com
   ```
4. Create Artifact Registry (Sydney region):  
   ```bash
   gcloud artifacts repositories create tabular-review \
     --repository-format=Docker --location=australia-southeast1 \
     --description="Tabular Review images"
   ```
5. Decide on names/region (used in the workflow):
   - `REGION`: `australia-southeast1` (Sydney)
   - `ARTIFACT_REPO`: `tabular-review`
   - `BACKEND_SERVICE`: `tabular-review-api`
   - `FRONTEND_SERVICE`: `tabular-review-web`

## Configure GitHub → Google Cloud auth (Workload Identity Federation)
Replace `<PROJECT_ID>`, `<PROJECT_NUMBER>`, `<GITHUB_OWNER>`, `<REPO_NAME>` below.

```bash
gcloud iam service-accounts create github-ci --display-name="GitHub Actions deployer"

gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:github-ci@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:github-ci@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud iam service-accounts add-iam-policy-binding \
  github-ci@<PROJECT_ID>.iam.gserviceaccount.com \
  --member="serviceAccount:github-ci@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"

gcloud iam workload-identity-pools create github-pool --location="global"

gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository"

gcloud iam service-accounts add-iam-policy-binding \
  github-ci@<PROJECT_ID>.iam.gserviceaccount.com \
  --member="principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/attribute.repository/<GITHUB_OWNER>/<REPO_NAME>" \
  --role="roles/iam.workloadIdentityUser"
```

## GitHub repo secrets/variables
- **Repository Secrets**
  - `WIF_PROVIDER`: `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
  - `WIF_SERVICE_ACCOUNT`: `github-ci@<PROJECT_ID>.iam.gserviceaccount.com`
  - `VITE_GEMINI_API_KEY`: Google AI Studio API key (used at frontend build).
  - `BACKEND_URL`: Set after first backend deploy (Cloud Run HTTPS URL). Temporarily you can use a placeholder to allow the first build, then update and redeploy.
- **Repository Variables**
  - `GCP_PROJECT`: `<PROJECT_ID>`
  - `GCP_REGION`: `australia-southeast1`
  - `ARTIFACT_REPO`: `tabular-review`
  - `BACKEND_SERVICE`: `tabular-review-api`
  - `FRONTEND_SERVICE`: `tabular-review-web`

## GitHub Actions workflow
- File: `.github/workflows/deploy.yml`
- Trigger: manual (`workflow_dispatch`) to avoid failing until secrets are set. After validation, change the trigger to push-on-main if desired.
- What it does:
  1) Authenticate to Google via WIF  
  2) Build & push backend image using `server/Dockerfile`  
  3) Build & push frontend image using root `Dockerfile` (passes `VITE_*` build args)  
  4) Deploy both images to Cloud Run (unauthenticated public)  

## First deployment flow (recommended)
1. **Build/Run locally (optional sanity check)**  
   ```bash
   docker build -t tr-backend -f server/Dockerfile server
   docker run --rm -p 8080:8080 tr-backend
   # In another shell:
   docker build -t tr-frontend .
   docker run --rm -p 8080:8080 tr-frontend
   ```
2. **Push code with the added Dockerfiles/workflow.**
3. **Run the workflow manually** (GitHub Actions → Deploy to Cloud Run → Run workflow).  
   - After the backend deploy completes, copy the backend Cloud Run URL (e.g., `https://tabular-review-api-xxxx-uc.a.run.app`) into the `BACKEND_URL` secret.  
   - Re-run the workflow so the frontend rebuilds with the correct `VITE_API_URL`.
4. **CORS**: Update `server/main.py` `origins` list to include your frontend Cloud Run URL (or set `["*"]` temporarily while you validate).
5. **Custom domain (optional)**: Use `gcloud run domain-mappings create` for each service and update DNS.

## Manual deploy alternative (if you prefer CLI)
```bash
# Backend
docker build -t australia-southeast1-docker.pkg.dev/<PROJECT_ID>/tabular-review/tabular-review-api:manual -f server/Dockerfile server
docker push australia-southeast1-docker.pkg.dev/<PROJECT_ID>/tabular-review/tabular-review-api:manual
gcloud run deploy tabular-review-api \
  --image australia-southeast1-docker.pkg.dev/<PROJECT_ID>/tabular-review/tabular-review-api:manual \
  --region australia-southeast1 --allow-unauthenticated

# Frontend (after setting BACKEND_URL build-arg)
docker build -t australia-southeast1-docker.pkg.dev/<PROJECT_ID>/tabular-review/tabular-review-web:manual \
  --build-arg VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY \
  --build-arg VITE_API_URL="https://tabular-review-api-xxxx-uc.a.run.app" \
  .
docker push australia-southeast1-docker.pkg.dev/<PROJECT_ID>/tabular-review/tabular-review-web:manual
gcloud run deploy tabular-review-web \
  --image australia-southeast1-docker.pkg.dev/<PROJECT_ID>/tabular-review/tabular-review-web:manual \
  --region australia-southeast1 --allow-unauthenticated
```

You’re ready to go once secrets/variables are set and the workflow is triggered. Adjust regions/names as needed.
