from tasks.queue import task_manager
from run import res_id
res = task_manager.GroupResult.restore(res_id)

status_list = []
while not res.ready():
    new_status_list = [c.status for c in res.children]
    if new_status_list != status_list:
        print(sum([1 if elem == "SUCCESS" else 0 for elem in new_status_list]))
        status_list = new_status_list
print(*res.get(), sep="\n")
