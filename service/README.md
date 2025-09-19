# Image Generation Service (FastAPI on Cloud Run)

Secure, production-ready wrapper around Google Gemini (google-generativeai) for image generation and editing.

## Endpoints
- `GET /healthz` — Health check
- `POST /generate` — Body: `{ "prompt": string }` → `{ imageBase64, modelId }`
- `POST /edit` — Body: `{ "prompt": string, "images": string[] }` where each image is a data URL, HTTP(S) URL, or plain base64 → `{ imageBase64, modelId }`

## Requirements
- Google Cloud project with billing enabled
- `gcloud` CLI authenticated and set to the correct project
- APIs: "Cloud Run Admin API", "Secret Manager API"

## Secrets
Do NOT store `GEMINI_API_KEY` in code. Use Secret Manager.

```bash
# Create the secret (first time)
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create gemini-api-key \
  --replication-policy="automatic" \
  --data-file=-

# Add a new version later
# echo -n "NEW_KEY" | gcloud secrets versions add gemini-api-key --data-file=-
```

## Build and Deploy (Cloud Run)
Two options are provided: (A) Cloud Build (recommended), (B) Local Docker.

### A) Cloud Build (no local Docker needed)
```bash
# From repo root
cd Image-Generation-Tool

# Build and deploy with Cloud Run (using Google-managed build)
gcloud run deploy image-generation-service \
  --source service \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars=GEMINI_IMAGE_MODEL=gemini-2.5-flash-image-preview \
  --set-env-vars=ALLOWED_ORIGINS=https://theinstructorshub.co.uk,https://www.theinstructorshub.co.uk \
  --set-secrets=GEMINI_API_KEY=gemini-api-key:latest
```

### B) Local Docker build and push (if you prefer)
```bash
# Variables
PROJECT_ID="$(gcloud config get-value project)"
REGION="us-central1"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/image-generation-service:latest"

# Enable Artifact Registry if needed
gcloud services enable artifactregistry.googleapis.com

# Create repository once (skip if exists)
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=${REGION} || true

# Build and push
docker build -t "$IMAGE" service

gcloud auth configure-docker ${REGION}-docker.pkg.dev

docker push "$IMAGE"

# Deploy
gcloud run deploy image-generation-service \
  --image "$IMAGE" \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars=GEMINI_IMAGE_MODEL=gemini-2.5-flash-image-preview \
  --set-env-vars=ALLOWED_ORIGINS=https://theinstructorshub.co.uk,https://www.theinstructorshub.co.uk \
  --set-secrets=GEMINI_API_KEY=gemini-api-key:latest
```

## CORS
Set `ALLOWED_ORIGINS` to a comma-separated list of your frontend origins. Example:
```
ALLOWED_ORIGINS=https://theinstructorshub.co.uk,https://www.theinstructorshub.co.uk,http://localhost:5173
```

## Frontend Integration
Configure your web app to call the Cloud Run URL:
- Set `VITE_IMAGE_API_URL` in `Image-Generation-Tool/.env` or CI/CD env configuration to the Cloud Run service URL (e.g., `https://image-generation-service-xxxx-uc.a.run.app`).
- Client example (POST /generate):

```ts
const res = await fetch(`${import.meta.env.VITE_IMAGE_API_URL}/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt }),
});
if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
const data = await res.json();
const imgSrc = `data:image/png;base64,${data.imageBase64}`;
```

## Observability and Security
- Use Cloud Logging (default) and monitor `image-generation-service` logs.
- Consider Cloud Armor for IP allow-listing or rate limiting.
- Keep Secret Manager key rotated and least-privilege IAM on the Cloud Run service account.

## Local Development
```bash
cd Image-Generation-Tool/service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY=YOUR_KEY
export ALLOWED_ORIGINS=*
uvicorn app.main:app --reload --port 8080
```

Open http://127.0.0.1:8080/healthz to verify.
