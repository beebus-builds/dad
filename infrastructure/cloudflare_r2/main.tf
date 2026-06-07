terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "shram-jagaran-tfstate"
    key            = "r2/terraform.tfstate"
    region         = "auto"
    endpoint       = "https://<accountid>.r2.cloudflarestorage.com"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    encrypt                      = true
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare API token with R2 edit permission"
}

variable "account_id" {
  type        = string
  description = "Cloudflare account ID"
}

variable "bucket_name" {
  type        = string
  default     = "shram-jagaran-uploads"
  description = "R2 bucket name for user uploads (member documents, event images, etc.)"
}

variable "bucket_location" {
  type        = string
  default     = "APAC"
  description = "R2 jurisdiction hint (APAC for Nepal)"
}

resource "cloudflare_r2_bucket" "uploads" {
  account_id = var.account_id
  name       = var.bucket_name
  location   = var.bucket_location
}

resource "cloudflare_r2_bucket_lifecycle" "uploads" {
  account_id = cloudflare_r2_bucket.uploads.account_id
  bucket_name = cloudflare_r2_bucket.uploads.name

  rules = [
    {
      id      = "expire-old-uploads"
      enabled = true
      conditions = {
        age = 365
      }
      actions = {
        abort_multipart_uploads = true
      }
    }
  ]
}

resource "cloudflare_r2_access_key" "app" {
  account_id = var.account_id
  name       = "shram-jagaran-app"
}

output "bucket_name" {
  value = cloudflare_r2_bucket.uploads.name
}

output "endpoint" {
  value = "https://${var.account_id}.r2.cloudflarestorage.com"
}

output "public_dev_url" {
  value = "https://${var.bucket_name}.${var.account_id}.r2.dev"
  description = "Public dev URL (disable in production via custom domain + access policy)"
}

output "access_key_id" {
  value     = cloudflare_r2_access_key.app.access_key_id
  sensitive = true
}

output "secret_access_key" {
  value     = cloudflare_r2_access_key.app.secret_access_key
  sensitive = true
}
