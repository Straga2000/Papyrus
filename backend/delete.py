from config.redis_conn import redis_instance

key_to_delete = redis_instance.keys("format:*")
# print(key_to_delete)
for key in key_to_delete:
    redis_instance.delete(key)
    print(f"Key {key} deleted")

# redis_instance.delete("project:structure:Straga2000:IntelliDoc")