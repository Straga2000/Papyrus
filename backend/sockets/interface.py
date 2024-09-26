import json

class QueueProtocol:
    def __init__(self, websocket, manager):
        self.ws = websocket
        self.manager = manager
        self.events = []

    async def add_event(self, name, queue_func, res_func):
        self.events.append((name, queue_func, res_func))

    async def create_handler(self):
        async for mes in self.ws:
            event = json.loads(mes)
            ev_type = event.get("type")
            print(event)

            if ev_type is None:
                await self.ws.send(json.dumps({"type": "error", "msg": "Event has no type"}))

            # for event_name, queue_func, res_func in self.events:
            event_name, queue_func, res_func = self.events[0]

            if ev_type == event_name:
                # extract args for queue func
                args = event.get("args", [])
                print("these are the args", args)
                kwargs = event.get("kwargs", {})
                task = queue_func.delay(*args, **kwargs)
                await self.ws.send(json.dumps({"type": ev_type, "id": task.id}))

            if ev_type == f"{event_name}:res":
                print("Enter fib result")
                # get id, verify the status of the func
                queue_func_id = event.get("id")
                task = self.manager.AsyncResult(queue_func_id)
                task_ready = task.ready()
                print(f"TASK STATUS: {task_ready}")

                task_res = task.get() if task_ready else None
                if res_func:
                    task_res = res_func(task_res)
                task_res = {"data": task_res}

                new_msg = {"type": f"{event_name}:res",
                                          "status": task_ready,
                                          "result": task_res}
                print("this is the new message", new_msg)
                await self.ws.send(json.dumps(new_msg))

            await self.ws.send(json.dumps({"type": "dummy"}))