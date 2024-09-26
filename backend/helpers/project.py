from storage.redis_store import RedisStore

def get_format_details(format_list):
    format_dict = {format_name: RedisStore.get(f"format:{format_name}") for format_name in format_list}
    format_dict = {key: format_dict[key] for key in format_dict if format_dict[key]}
    return format_dict

def set_format_details(format_dict):
    for format_name in format_dict:
        RedisStore.set(f"format:{format_name}", format_dict[format_name])
        print(f"{format_name} was saved.")
