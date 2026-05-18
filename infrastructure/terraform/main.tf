terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "cardiq-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-south-1" # Assuming India region for Fintech
  }
}

provider "aws" {
  region = var.aws_region
}

# --- VPC & Networking ---
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "cardiq-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true # For cost optimization, use false for strict HA
}

# --- EKS Cluster ---
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.3"

  cluster_name    = "cardiq-cluster"
  cluster_version = "1.27"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      desired_size = 2
      min_size     = 2
      max_size     = 5

      instance_types = ["t3.large"]
      capacity_type  = "ON_DEMAND"
    }
    workers = {
      desired_size = 1
      min_size     = 1
      max_size     = 3
      instance_types = ["t3.medium"]
      capacity_type  = "SPOT" # Cost optimization for async scrapers
    }
  }
}

# --- RDS PostgreSQL ---
module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.1.0"

  identifier = "cardiq-postgres"
  engine     = "postgres"
  engine_version = "15.3"
  instance_class = "db.t4g.large"
  allocated_storage = 50

  db_name  = "cardiq"
  username = "cardiqadmin"
  port     = 5432

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  subnet_ids             = module.vpc.private_subnets

  multi_az               = true # Critical for DR
  skip_final_snapshot    = false
  backup_retention_period = 7
}

# --- ElastiCache Redis ---
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "cardiq-redis"
  engine               = "redis"
  node_type            = "cache.t4g.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "cardiq-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}
