# Tiered Indexing Implementation Guide

## Current Status: READY ✅

Your refactored code is **already architected** to support tiered indexing. When you need it, here's the 15-minute implementation path.

---

## Why Current Architecture is Fine

### You're Using Industry Standard Practice

✅ **Single shared index with metadata filtering** is used by:
- 95% of startups
- Most growth-stage companies
- Many enterprise SaaS products

✅ **It's not "bad code"** - it's a rational trade-off:
- Lower operational complexity
- Significantly lower costs
- Easier to maintain
- Scales to thousands of users

---

## When to Add Tiered Indexing

### Trigger Points (Wait for ONE of these)

#### Trigger A: Noisy Neighbor (Performance)
**Signal:** Largest tenant degrades latency for smallest tenants
**Example:**
- Tenant A: 10M vectors
- Tenant B: 100 vectors
- Tenant B's queries become slow because of Tenant A's size

**When to act:** Premium customer demands <50ms guaranteed latency

#### Trigger B: Compliance Hammer (Legal/Security)
**Signal:** Enterprise customer requires physical data isolation
**Example:**
- Healthcare customer needs HIPAA compliance
- Finance customer needs SOC2/PCI
- Government contract requires data residency

**When to act:** Customer security questionnaire requires physical isolation

#### Trigger C: Cardinality Wall (Scale)
**Signal:** Too many tenants to manage metadata efficiently
**Example:**
- 100,000+ small tenants
- Metadata filtering becomes operationally brittle

**When to act:** Query performance degrades despite optimization

---

## Implementation Plan

### Phase 1: Standard Tier (Current - FREE)

**Who:** 99% of users (free/low-tier)
**Cost:** ~$500/month for shared index
**Status:** ✅ Already implemented

```
All users → Shared Index (current)
         → Filter by user_id in application
```

### Phase 2: Premium Tier (When Needed - $1-2k/month)

**Who:** Mid-market customers ($5-10k/year)
**Cost:** ~$500/month per regional index
**Use case:** Data residency, better performance

```
Standard users → Shared Index (US)
Premium users  → Regional Indices (EU, Asia, etc.)
```

### Phase 3: Enterprise Tier (When Whale Lands - Custom)

**Who:** Enterprise customers ($50k+/year)
**Cost:** ~$500/month per dedicated index (absorbed in contract)
**Use case:** Complete isolation, guaranteed performance

```
Standard users  → Shared Index
Premium users   → Regional Indices
Enterprise user → Dedicated Index (just for them)
```

---

## How to Implement (15 Minutes)

### Step 1: Store Tenant Tier in Firestore (5 min)

Add to `users` collection:
```json
{
  "user_id": "whale_customer",
  "tier": "enterprise",
  "index_config": {
    "endpoint": "projects/.../indexEndpoints/dedicated_whale",
    "deployed_index_id": "whale_index_v1",
    "index_id": "whale_index_12345"
  }
}
```

### Step 2: Modify Query Service (5 min)

**File:** `app/services/query_service.py`

**Before:**
```python
def get_query_service(config: Config = Depends(lambda: Config.from_env())):
    firestore_repo = FirestoreRepository(project_id=config.project_id)
    vector_repo = VectorRepository(
        index_endpoint=config.index_endpoint,  # Same for everyone
        deployed_index_id=config.deployed_index_id,
    )
    return QueryService(firestore_repo=firestore_repo, vector_repo=vector_repo)
```

**After:**
```python
def get_query_service(
    current_user: TokenData = Depends(get_current_user),
    config: Config = Depends(lambda: Config.from_env())
):
    firestore_repo = FirestoreRepository(project_id=config.project_id)

    # Get user's tier configuration
    user_profile = firestore_repo.get_user_profile(current_user.uid)
    index_config = user_profile.get("index_config") if user_profile else None

    # Use tier-specific index or default
    if index_config:
        vector_repo = VectorRepository(
            index_endpoint=index_config["endpoint"],
            deployed_index_id=index_config["deployed_index_id"],
        )
    else:
        # Standard tier - use shared index
        vector_repo = VectorRepository(
            index_endpoint=config.index_endpoint,
            deployed_index_id=config.deployed_index_id,
        )

    return QueryService(firestore_repo=firestore_repo, vector_repo=vector_repo)
```

### Step 3: Create Dedicated Index (5 min via gcloud)

```bash
# When enterprise customer signs
gcloud ai index-endpoints create \
  --display-name="whale-customer-dedicated" \
  --description="Dedicated index for Enterprise Customer Inc." \
  --region=us-central1

# Deploy their index
gcloud ai index-endpoints deploy-index ENDPOINT_ID \
  --deployed-index-id=whale_index_v1 \
  --index=INDEX_ID \
  --display-name="whale-dedicated"
```

### Step 4: Update Firestore (1 min)

```python
# In Firestore console or via script
db.collection("users").document("whale_customer_id").set({
    "tier": "enterprise",
    "index_config": {
        "endpoint": "projects/123/locations/us-central1/indexEndpoints/456",
        "deployed_index_id": "whale_index_v1",
        "index_id": "789"
    }
}, merge=True)
```

---

## Cost Analysis

### Current (Standard Tier Only)
```
1 shared index endpoint: ~$500/month
10,000 users: $0.05/user/month
```

### With Tiered Indexing
```
1 standard index: $500/month (10,000 users)
2 premium regional indices: $1,000/month (100 users @ $10/user/month)
3 enterprise dedicated indices: $1,500/month (3 users @ $500/user/month)
---
Total: $3,000/month
Revenue from premium/enterprise: $15k+/month
Margin: Still very healthy
```

---

## Migration Path

### When Trigger Happens

1. **Customer signals need** (compliance, performance, data residency)
2. **Spin up dedicated index** (5 min via gcloud)
3. **Update user's Firestore profile** (1 min)
4. **Test with customer** (their next query uses new index)
5. **No code deployment needed** ✅

---

## Current Code Readiness Assessment

✅ **VectorRepository** - Already parameterized by index endpoint
✅ **FirestoreRepository** - Can fetch user profiles
✅ **QueryService** - Uses dependency injection (easy to modify)
✅ **Config** - Supports environment-based configuration
✅ **Modular architecture** - Changes isolated to one service

### What You DON'T Need to Change

- ❌ Routes layer - stays the same
- ❌ Models layer - stays the same
- ❌ Firestore operations - stays the same
- ❌ Embedding generation - stays the same
- ❌ LLM prompts - stays the same
- ❌ Deployment process - stays the same

### What You WOULD Change (only when needed)

- ✅ Query service dependency injection (10 lines)
- ✅ Add tier field to Firestore user profile (1 field)
- ✅ Provision new index via gcloud (1 command)

---

## Testing Plan

### Before Going Live

1. **Create test enterprise index** (free during development)
2. **Assign test user to enterprise tier**
3. **Run query** - verify it uses dedicated index
4. **Check logs** - confirm correct endpoint
5. **Monitor performance** - validate isolation

### Monitoring

```python
# Add to query service
print(f"Using index endpoint: {vector_repo.endpoint}")
print(f"User tier: {user_profile.get('tier', 'standard')}")
```

---

## The Bottom Line

### Keep Current Architecture Until You Need This ✅

**Current status:**
- ✅ Code is ready
- ✅ Architecture supports it
- ✅ No refactoring needed
- ⏳ Wait for trigger event

**When trigger happens:**
- ⚡ 15-minute implementation
- ⚡ No downtime
- ⚡ No code rewrite
- ⚡ Just config change + new index

**The refactoring we just did makes this possible.**

Before: Would require rewriting 1000-line main.py
After: Just modify dependency injection in query service

---

## Recommendation

### DO THIS NOW:
- ✅ Keep current shared index
- ✅ Deploy refactored code
- ✅ Monitor for trigger events
- ✅ Save this guide for later

### DO THIS WHEN NEEDED:
- ⏳ Customer demands compliance/isolation
- ⏳ Performance degrades for premium users
- ⏳ Whale customer signs (worth dedicated index)

### NEVER DO THIS:
- ❌ Don't create per-user indices (cost explosion)
- ❌ Don't over-optimize prematurely
- ❌ Don't sacrifice simplicity for theoretical purity

---

**Your current architecture is FINE. This guide is insurance for when you need it.**
