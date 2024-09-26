import redis

try:
    pool = redis.ConnectionPool(
        host="localhost",
        port="6379"
    )

    redis_instance = redis.Redis(connection_pool=pool)
except Exception as e:
    redis_instance = None