from celery import Celery

# celery multi start w1 -A conf -l INFO
# add.apply_async((2, 2), queue='lopri', countdown=10)

# celery -A conf worker --loglevel=INFO
# celery -A config.celery_conn worker --concurrency=2 --loglevel=INFO
task_manager = Celery('conf',
                      backend='redis://localhost:6379/0',
                      broker='redis://localhost:6379/0',
                      include=["tasks.github", "tasks.documentor"])
