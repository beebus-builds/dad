terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" { type = string; sensitive = true }
variable "account_id"            { type = string }
variable "zone_id"               { type = string }
variable "domain" {
  type        = string
  default     = "shramjagaran.np"
  description = "Apex domain registered with Cloudflare"
}

variable "frontend_subdomain" {
  type    = string
  default = "app"
}

variable "api_subdomain" {
  type    = string
  default = "api"
}

resource "cloudflare_record" "frontend" {
  zone_id = var.zone_id
  name    = var.frontend_subdomain
  type    = "CNAME"
  content = "${var.frontend_subdomain}.${var.domain}.cdn.cloudflare.net"
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "api" {
  zone_id = var.zone_id
  name    = var.api_subdomain
  type    = "CNAME"
  content = "${var.api_subdomain}.${var.domain}.cdn.cloudflare.net"
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "root_apex" {
  zone_id = var.zone_id
  name    = "@"
  type    = "A"
  content = "192.0.2.1"
  proxied = true
  ttl     = 1
  comment = "Update to your origin IP; this is a placeholder"
}

output "frontend_hostname" { value = "${var.frontend_subdomain}.${var.domain}" }
output "api_hostname"      { value = "${var.api_subdomain}.${var.domain}" }
