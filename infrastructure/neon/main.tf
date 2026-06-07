terraform {
  required_version = ">= 1.5.0"

  required_providers {
    neon = {
      source  = "neondatabase/neon"
      version = "~> 0.10"
    }
  }

  backend "s3" {
    bucket         = "shram-jagaran-tfstate"
    key            = "neon/terraform.tfstate"
    region         = "auto"
    endpoint       = "https://<accountid>.r2.cloudflarestorage.com"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    encrypt                      = true
  }
}

provider "neon" {
  api_key = var.neon_api_key
}

variable "neon_api_key" {
  type        = string
  sensitive   = true
  description = "Neon API key (https://console.neon.tech/app/settings/api-keys)"
}

variable "project_name" {
  type        = string
  default     = "shram-jagaran-cms"
  description = "Neon project name"
}

variable "region" {
  type        = string
  default     = "aws-ap-south-1"
  description = "AWS region (ap-south-1 is Mumbai for low latency to Nepal)"
}

variable "pg_version" {
  type        = number
  default     = 16
  description = "PostgreSQL major version"
}

resource "neon_project" "main" {
  name = var.project_name
  region_id = var.region
  pg_version = var.pg_version

  default_endpoint_settings {
    autoscaling_limit_min = 0.25
    autoscaling_limit_max = 2
    suspend_timeout_seconds = 300
  }
}

resource "neon_branch" "main" {
  project_id = neon_project.main.id
  name       = "main"
}

resource "neon_branch" "preview" {
  count      = var.enable_preview_branch ? 1 : 0
  project_id = neon_project.main.id
  name       = "preview"
  parent_id  = neon_branch.main.id
}

variable "enable_preview_branch" {
  type    = bool
  default = false
}

resource "neon_database" "cms" {
  project_id = neon_project.main.id
  branch_id  = neon_branch.main.id
  name       = "shram_jagaran"
  owner_name = "shram_jagaran_owner"
}

resource "neon_role" "app" {
  project_id = neon_project.main.id
  branch_id  = neon_branch.main.id
  name       = "shram_app"
}

output "project_id" {
  value       = neon_project.main.id
  description = "Neon project ID"
}

output "main_branch_host" {
  value       = neon_branch.main.host
  description = "Main branch hostname (read-write)"
}

output "main_branch_pooled_host" {
  value       = "${neon_branch.main.id}-pooler.${var.region}.aws.neon.tech}"
  description = "PgBouncer-pooled hostname for serverless connections"
}

output "main_branch_connection_string" {
  value       = "postgres://${neon_role.app.name}:${neon_role.app.password}@${neon_branch.main.host}/shram_jagaran?sslmode=require"
  sensitive   = true
  description = "Direct (non-pooled) connection string"
}

output "pooled_connection_string" {
  value       = "postgres://${neon_role.app.name}:${neon_role.app.password}@${neon_branch.main.id}-pooler.${var.region}.aws.neon.tech/shram_jagaran?sslmode=require"
  sensitive   = true
  description = "Pooled connection string for serverless deploys"
}

output "read_only_connection_string" {
  value       = "postgres://${neon_role.app.name}:${neon_role.app.password}@${neon_branch.main.host}/shram_jagaran?sslmode=require&options=-c%20default_transaction_read_only%3Don"
  sensitive   = true
  description = "Read-only connection string for analytics"
}
