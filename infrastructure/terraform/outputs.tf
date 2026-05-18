output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "db_endpoint" {
  description = "Connection endpoint for the RDS instance"
  value       = module.db.db_instance_endpoint
}

output "redis_endpoint" {
  description = "Connection endpoint for Redis"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}
