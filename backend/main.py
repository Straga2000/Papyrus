from conf import add, fib
# result = add.delay(4, 4)
result = fib.delay(30)

while True:
    # res.id
    # res.state
    # PENDING -> STARTED -> RETRY -> STARTED -> RETRY -> STARTED -> SUCCESS
    # from celery import group
    # group(add.s(i, i) for i in range(10))().get()
    # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

    # from celery import chain
    # chain(add.s(4, 4) | mul.s(8))().get()

    if result.ready():
        print(result.get())
        break
    else:
        print("NOT READY")