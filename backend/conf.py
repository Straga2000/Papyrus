# from celery import Celery
#
# # celery multi start w1 -A conf -l INFO
# # add.apply_async((2, 2), queue='lopri', countdown=10)
#
# app = Celery('conf', backend='redis://localhost', broker='redis://localhost')
#
# @app.task
# def add(x, y):
#     return x + y
#
# @app.task
# def fib(n):
#     if n == 0:
#         return 1
#     if n == 1:
#         return 1
#     else:
#         return fib(n - 1) + fib(n - 2)