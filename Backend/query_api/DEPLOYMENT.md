# Backend Deployment Instructions

## Prerequisites
- Google Cloud SDK installed (`gcloud` command available)
- Authenticated with Google Cloud: `gcloud auth login`
- Project set: `gcloud config set project sunlit-adviser-471323-p0`

## Deploy Backend

### Option 1: Using Deployment Script (Recommended)
```bash
cd Backend/query_api
./deploy.sh
```

### Option 2: Manual Deployment
```bash
cd Backend/query_api

gcloud run deploy clearchartai-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars PROJECT_ID=sunlit-adviser-471323-p0 \
  --project sunlit-adviser-471323-p0
```

## After Deployment

1. **Note the Service URL**
   - Cloud Run will output a URL like: `https://clearchartai-api-xxxxx-uc.a.run.app`
   - Test it: `curl https://YOUR-URL/`

2. **Update Frontend Environment**
   - Update `frontend/.env.production`
   - Set `VITE_API_URL` to the Cloud Run URL

3. **Map Custom Domain (Optional)**
```bash
gcloud run domain-mappings create \
  --service clearchartai-api \
  --domain api.clearchartai.io \
  --region us-central1 \
  --project sunlit-adviser-471323-p0
```

4. **Add DNS Record**
   - Go to your domain registrar
   - Add CNAME record: `api` → `ghs.googlehosted.com`

## Verify Deployment
```bash
# Check service status
gcloud run services describe clearchartai-api --region us-central1

# View logs
gcloud run logs read clearchartai-api --region us-central1

# Test health endpoint
curl https://YOUR-CLOUD-RUN-URL/
```

## Rollback (if needed)
```bash
# List revisions
gcloud run revisions list --service clearchartai-api --region us-central1

# Rollback to previous revision
gcloud run services update-traffic clearchartai-api \
  --to-revisions REVISION-NAME=100 \
  --region us-central1
```
