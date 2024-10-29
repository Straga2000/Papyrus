import json

from celery import group


class QueueProtocol:
    def __init__(self, websocket, manager):
        self.ws = websocket
        self.manager = manager
        self.events = []

    async def add_event(self, name, queue_func, res_func, group=False):
        self.events.append((name, queue_func, res_func, group))

    async def event_generator(self):
        for event in self.events:
            yield event
        return

    async def create_handler(self):
        async for mes in self.ws:
            event = json.loads(mes)
            ev_type = event.get("type")

            if ev_type is None:
                await self.ws.send(json.dumps({"type": "error", "msg": "Event has no type"}))

            async for event_elem in self.event_generator():
                if event_elem[-1] is False:
                # print(f"we have here the event we are seeing {event_elem[0]}")
                    await self.resolve_task(event, event_elem)
                else:
                    await self.resolve_task_group(event, event_elem)

            await self.ws.send(json.dumps({"type": "heartbeat"}))

            # await self.ws.send(json.dumps({"type": "dummy"}))


    async def resolve_task(self, event_msg, event_def):
        event_name, queue_func, res_func, _ = event_def
        ev_type = event_msg.get("type")
        print("On resolve task group false", event_name, ev_type)
        if ev_type == event_name:
            # extract args for queue func
            args = event_msg.get("args", [])
            kwargs = event_msg.get("kwargs", {})
            task = queue_func.delay(*args, **kwargs)

            await self.ws.send(
                json.dumps({"type": ev_type, "id": task.id})
            )

        if ev_type == f"{event_name}:res":
            print("Enter res function")
            # get id, verify the status of the func
            queue_func_id = event_msg.get("id")
            task = self.manager.AsyncResult(queue_func_id)
            task_ready = task.ready()
            print(f"TASK STATUS: {task_ready}")

            task_res = task.get() if task_ready else None

            if res_func and task_res:
                task_res = res_func(task_res)
            task_res = {"data": task_res}

            new_msg = {"type": f"{event_name}:res",
                       "status": task_ready,
                       "result": task_res,
                       "id": queue_func_id}

            await self.ws.send(
                json.dumps(new_msg)
            )
            print(f"response for {ev_type} was sent theoretically")

        await self.ws.send(json.dumps({"type": "heartbeat"}))


    async def resolve_task_group(self, event_msg, event_def):
        event_name, queue_func, res_func, _ = event_def
        print(f"On resolve task group true with task type {event_name}")

        ev_type = event_msg.get("type")
        if ev_type == event_name:
            # extract args for queue func
            args = event_msg.get("args", [])
            kwargs = event_msg.get("kwargs", {})
            task = group([queue_func.s(elem) for elem in args])
            res = task.apply_async()
            print("Apply async")
            res.save()
            print(res.id)
            print(f"Send task type {event_name} response")
            # await self.ws.send(json.dumps({"type": "fuck off"}))

            try:
                await self.ws.send(json.dumps({"type": event_name, "id": res.id}))
            except Exception as e:
                print("EXCEPTION ON SEND", e)
            return True

        if ev_type == f"{event_name}:res":
            print(f"Enter group result function for task {event_name}")
            queue_func_id = event_msg.get("id")
            task = self.manager.GroupResult.restore(queue_func_id)
            task_ready = task.ready()
            print(f"TASK STATUS: {task_ready}")
            print("THESE ARE THE CHILDREN", [c.status for c in task.children])

            percent_status = 1.0 * sum([1 if c.status == "SUCCESS" else 0 for c in task.children]) / len(
                    task.children) if not task_ready else 1

            task_res = None if not task_ready else task.join()
            if res_func:
                task_res = res_func(task_res)

            new_msg = {
                "type": f"{event_name}:res",
                "status": task_ready,
                "percent": int(percent_status * 100),
                "result": task_res,
                "id": queue_func_id
            }

            await self.ws.send(json.dumps(new_msg))
            return True

        return False