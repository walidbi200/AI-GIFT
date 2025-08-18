terraform {
  required_version = ">= 1.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure providers
provider "vercel" {
  api_token = var.vercel_api_token
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "smartgiftfinder"
}

variable "domain" {
  description = "Domain name"
  type        = string
  default     = "smartgiftfinder.xyz"
}

# Vercel Project
resource "vercel_project" "main" {
  name      = var.project_name
  framework = "vite"
  
  git_repository = {
    type = "github"
    repo = "your-username/smartgiftfinder"
  }
  
  environment = [
    {
      key   = "NODE_ENV"
      value = "production"
    },
    {
      key   = "JWT_SECRET"
      value = var.jwt_secret
    },
    {
      key   = "OPENAI_API_KEY"
      value = var.openai_api_key
    },
    {
      key   = "UPSTASH_REDIS_REST_URL"
      value = var.upstash_redis_url
    },
    {
      key   = "UPSTASH_REDIS_REST_TOKEN"
      value = var.upstash_redis_token
    }
  ]
}

# Custom Domain
resource "vercel_project_domain" "main" {
  project_id = vercel_project.main.id
  domain     = var.domain
}

# DNS Records
resource "vercel_dns_record" "main" {
  domain = var.domain
  name   = "@"
  type   = "A"
  value  = "76.76.19.19"
}

resource "vercel_dns_record" "www" {
  domain = var.domain
  name   = "www"
  type   = "CNAME"
  value  = "cname.vercel-dns.com"
}

# AWS S3 Bucket for backups
resource "aws_s3_bucket" "backups" {
  bucket = "${var.project_name}-backups-${random_string.bucket_suffix.result}"
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "backup_retention"
    status = "Enabled"

    expiration {
      days = 30
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM User for backup access
resource "aws_iam_user" "backup_user" {
  name = "${var.project_name}-backup-user"
}

resource "aws_iam_access_key" "backup_user" {
  user = aws_iam_user.backup_user.name
}

resource "aws_iam_user_policy" "backup_policy" {
  name = "${var.project_name}-backup-policy"
  user = aws_iam_user.backup_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.backups.arn,
          "${aws_s3_bucket.backups.arn}/*"
        ]
      }
    ]
  })
}

# CloudWatch Log Group for application logs
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/lambda/${var.project_name}"
  retention_in_days = 14
}

# Outputs
output "project_id" {
  description = "Vercel project ID"
  value       = vercel_project.main.id
}

output "project_url" {
  description = "Vercel project URL"
  value       = vercel_project.main.url
}

output "domain_url" {
  description = "Custom domain URL"
  value       = "https://${var.domain}"
}

output "backup_bucket_name" {
  description = "S3 bucket name for backups"
  value       = aws_s3_bucket.backups.bucket
}

output "backup_user_access_key" {
  description = "AWS access key for backup user"
  value       = aws_iam_access_key.backup_user.id
  sensitive   = true
}

output "backup_user_secret_key" {
  description = "AWS secret key for backup user"
  value       = aws_iam_access_key.backup_user.secret
  sensitive   = true
}
