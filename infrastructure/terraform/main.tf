# Terraform configuration for Smart Gift Finder infrastructure
# This is a basic configuration - in production, you'd want more comprehensive setup

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
  # Vercel API token should be set via environment variable VERCEL_API_TOKEN
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "project_name" {
  description = "Name of the Vercel project"
  type        = string
  default     = "smartgiftfinder"
}

variable "domain" {
  description = "Custom domain for the application"
  type        = string
  default     = "smartgiftfinder.xyz"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
  default     = "production"
}

# Vercel Project
resource "vercel_project" "smartgiftfinder" {
  name      = var.project_name
  framework = "vite"
  
  git_repository = {
    type = "github"
    repo = "your-username/smartgiftfinder" # Update with your actual repo
  }
  
  environment = [
    {
      key   = "NODE_ENV"
      value = var.environment
    },
    {
      key   = "POSTGRES_URL"
      value = var.postgres_url
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
      key   = "VITE_GA_TRACKING_ID"
      value = var.ga_tracking_id
    }
  ]
}

# Custom Domain
resource "vercel_project_domain" "smartgiftfinder" {
  project_id = vercel_project.smartgiftfinder.id
  domain     = var.domain
}

# DNS Records (if using Cloudflare or similar)
# This is commented out as it depends on your DNS provider
/*
resource "cloudflare_record" "smartgiftfinder" {
  zone_id = var.cloudflare_zone_id
  name    = var.domain
  value   = "cname.vercel-dns.com"
  type    = "CNAME"
  proxied = true
}
*/

# S3 Bucket for backups
resource "aws_s3_bucket" "backups" {
  bucket = "${var.project_name}-backups-${var.environment}"
  
  tags = {
    Name        = "${var.project_name}-backups"
    Environment = var.environment
    Project     = var.project_name
  }
}

# S3 Bucket versioning
resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket lifecycle policy
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

# S3 Bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket public access block
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
  
  tags = {
    Name        = "${var.project_name}-backup-user"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Access Key for backup user
resource "aws_iam_access_key" "backup_user" {
  user = aws_iam_user.backup_user.name
}

# IAM Policy for backup access
resource "aws_iam_user_policy" "backup_user" {
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
          "s3:ListBucket",
          "s3:DeleteObject"
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
resource "aws_cloudwatch_log_group" "smartgiftfinder" {
  name              = "/aws/lambda/${var.project_name}"
  retention_in_days = 14
  
  tags = {
    Name        = "${var.project_name}-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Alarms for monitoring
resource "aws_cloudwatch_metric_alarm" "api_errors" {
  alarm_name          = "${var.project_name}-api-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors API errors"
  
  dimensions = {
    FunctionName = "${var.project_name}-api"
  }
}

# Outputs
output "vercel_project_id" {
  description = "Vercel project ID"
  value       = vercel_project.smartgiftfinder.id
}

output "vercel_project_url" {
  description = "Vercel project URL"
  value       = vercel_project.smartgiftfinder.url
}

output "backup_bucket_name" {
  description = "S3 bucket name for backups"
  value       = aws_s3_bucket.backups.bucket
}

output "backup_user_access_key" {
  description = "Access key for backup user"
  value       = aws_iam_access_key.backup_user.id
  sensitive   = true
}

output "backup_user_secret_key" {
  description = "Secret key for backup user"
  value       = aws_iam_access_key.backup_user.secret
  sensitive   = true
}

# Variables that should be set via environment or terraform.tfvars
variable "postgres_url" {
  description = "PostgreSQL connection URL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "ga_tracking_id" {
  description = "Google Analytics tracking ID"
  type        = string
  default     = "G-5VXMXKEYEV"
}
