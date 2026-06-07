# Shram Jagaran CMS — Infrastructure

Terraform configurations for the cloud resources powering the platform.

## Layout

| Module                | Provider        | Purpose                                                |
|-----------------------|-----------------|--------------------------------------------------------|
| `neon/`               | `neon`          | Serverless PostgreSQL project, branch, role, database. |
| `cloudflare_r2/`      | `cloudflare`    | Object storage for member documents, event images.     |
| `cloudflare_dns/`     | `cloudflare`    | DNS records for `app.` and `api.` subdomains.          |

## Region choice

Neon and R2 are pinned to **APAC (Mumbai / `aws-ap-south-1`)** for the lowest latency to Kathmandu. Swap to a closer region if you serve users in Malaysia or the Gulf.

## Bootstrap (one-time)

```bash
cd infrastructure
export NEON_API_KEY=...
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...

terraform -chdir=neon init
terraform -chdir=neon apply
terraform -chdir=cloudflare_r2 init
terraform -chdir=cloudflare_r2 apply
terraform -chdir=cloudflare_dns init \
  -var="zone_id=$(cloudflare zones list | jq -r '.[] | select(.name==\"shramjagaran.np\") | .id')"
terraform -chdir=cloudflare_dns apply
```

The Neon `apply` prints the **pooled connection string** — copy that into the backend `.env` as `DATABASE_URL`.

## State

State files are stored in a private R2 bucket via the S3-compatible backend. To bootstrap the bucket, run the first apply with a `local` backend, then move `terraform.tfstate` to R2 and update the `backend "s3"` block.

## Secrets

`NEON_API_KEY` and `CLOUDFLARE_API_TOKEN` must never be committed. Provide them via:
- CI: repository secrets
- Local: `terraform.tfvars` (git-ignored) or `TF_VAR_neon_api_key` env var

## Cost estimate (low-traffic MVP)

| Resource   | Tier                  | Monthly USD |
|------------|-----------------------|-------------|
| Neon       | Launch (0.25–2 CU)    | $0 – $70    |
| R2         | 10 GB storage + egress| $0.10       |
| Cloudflare | Free                  | $0          |
