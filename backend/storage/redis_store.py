import struct

import numpy as np

from config.redis_conn import redis_instance
from orjson import loads, dumps


class RedisStore:
    redis = redis_instance
    pipeline = redis.pipeline()

    @classmethod
    def set(cls, key, data_object, ttl=None):
        if redis_instance:
            data_serialized = dumps(data_object)
            if ttl:
                return cls.redis.set(key, data_serialized, ex=ttl)
            else:
                return cls.redis.set(key, data_serialized)
        return None

    @classmethod
    def get(cls, key):
        if not redis_instance:
            return None

        data_serialized = cls.redis.get(key)
        return loads(data_serialized) if data_serialized else None

    @classmethod
    def get_all(cls, keys):
        for key in keys:
            cls.pipeline.get(key)
        values = cls.pipeline.execute()
        values = {key: loads(value) if value else None for value, key in zip(values, keys)}
        return values

    @classmethod
    def delete(cls, keys):
        cls.redis.delete(*keys)

    @classmethod
    def find_by_pattern(cls, pattern):
        return cls.redis.scan_iter(pattern)

    # bulk operations should be done with a pipeline
    @classmethod
    def set_all(cls, keys, data_objects, ttl=None):
        data_objects = [dumps(data_object) for data_object in data_objects]
        for key, data_object in zip(keys, data_objects):
            if ttl:
                cls.pipeline.set(key, data_object, ex=ttl)
            else:
                cls.pipeline.set(key, data_object)
        return cls.pipeline.execute()

    @classmethod
    def set_numpy(cls, key, np_arr, ttl=None):
        # transform shape to bytes
        # add length of shape to make reading independent by the size
        shape_size = len(np_arr.shape)
        shape = struct.pack(f">{'I' * shape_size}", *np_arr.shape)
        shape_size = struct.pack(">I", shape_size)
        np_arr = shape_size + shape + np_arr.tobytes()

        if ttl:
            return cls.redis.set(key, np_arr, ex=ttl)
        else:
            return cls.redis.set(key, np_arr)

    @classmethod
    def get_numpy(cls, key):
        encoded_arr = cls.redis.get(key)
        if not encoded_arr:
            return None
        shape_length = struct.unpack(">I", encoded_arr[:4])[0]
        shape = struct.unpack(f">{'I' * shape_length}", encoded_arr[4:(shape_length * 4) + 4])
        np_arr = np.frombuffer(encoded_arr[(shape_length * 4) + 4:])

        try:
            np_arr = np_arr.reshape(shape)
            return np_arr
        except ValueError as e:
            cls.redis.delete(key)
            return None