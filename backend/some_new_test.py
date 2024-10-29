from celery import group
from celery.result import AsyncResult, GroupResult

from tasks.github import get_answer
from config.celery_conn import task_manager

g = group([get_answer.s({
    "value1": i,
    "value2": i
}) for i in range(20)])
res = g.apply_async(timeout=100)
res.save()
res_id = res.id

obtained_task = task_manager.GroupResult.restore(res_id)
print(obtained_task)
status_list = []
while not obtained_task.ready():
    new_status_list = [c.status for c in obtained_task.children]

    if new_status_list != status_list:
        print("Documentation percentage", sum(
            [1 if elem == "SUCCESS" else 0 for elem in new_status_list]
        ) / len(new_status_list))
        status_list = new_status_list
print(*obtained_task.get(), sep="\n")
