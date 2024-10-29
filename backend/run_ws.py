import json

from sockets.interface import QueueProtocol
from config.celery_conn import task_manager
from websockets.asyncio.server import serve
import asyncio

# add the tasks here
from tasks.documentor import get_formats, get_documentation


async def handler(websocket):
    # async for mes in websocket:
    #     event = json.loads(mes)
    #     ev_type = event.get("type")
    #     print(event)
    #
    #     answer = json.dumps({"type": "error", "msg": "no answer"})
    #     if ev_type is None:
    #         answer = json.dumps({"type": "error", "msg": "Event has no type"})
    #     elif ev_type == "heartbeat":
    #         print("HEARTBEAT HERE")
    #         answer = json.dumps({"type": "heartbeat"})
    #         continue
    #     elif ev_type == "file_formats":
    #         # extract args for queue func
    #         args = event.get("args", [])
    #         kwargs = event.get("kwargs", {})
    #         task = get_formats.delay(*args, **kwargs)
    #         answer = json.dumps({"type": ev_type, "id": task.id})
    #     elif ev_type == f"file_formats:res":
    #         print("Enter file formats result")
    #         # get id, verify the status of the func
    #         queue_func_id = event.get("id")
    #         task = task_manager.AsyncResult(queue_func_id)
    #         task_ready = task.ready()
    #         print(f"TASK STATUS file formats: {task_ready}")
    #
    #         task_res = task.get() if task_ready else None
    #         task_res = {"data": task_res}
    #
    #         new_msg = {"type": f"file_formats:res",
    #                    "status": task_ready,
    #                    "result": task_res,
    #                    "id": queue_func_id}
    #
    #         answer = json.dumps(new_msg)
    #         print(f"response for {ev_type} was sent theoretically")
    #     elif ev_type == "file_docs":
    #         print("================= Enters file docs init ======================")
    #         # extract args for queue func
    #         args = event.get("args", [])
    #         kwargs = event.get("kwargs", {})
    #         task = get_documentation.delay(*args, **kwargs)
    #         print(f"TASK WITH ID {task.id}")
    #         answer = json.dumps({"type": ev_type, "id": task.id})
    #         print("================== Leaves file docs init ===============================")
    #     elif ev_type == f"file_docs:res":
    #         print("Enter file docs result function function")
    #         # get id, verify the status of the func
    #         queue_func_id = event.get("id")
    #         task = task_manager.AsyncResult(queue_func_id)
    #         task_ready = task.ready()
    #         print(f"TASK STATUS: {task_ready}")
    #
    #         task_res = task.get() if task_ready else None
    #         task_res = {"data": task_res}
    #
    #         new_msg = {"type": f"file_docs:res",
    #                    "status": task_ready,
    #                    "result": task_res,
    #                    "id": queue_func_id}
    #
    #         answer =  json.dumps(new_msg)
    #         print(f"response for {ev_type} was sent theoretically")
    #
    #     print("THIS IS ANS", answer)
    #     await websocket.send(answer)
    #
    # await asyncio.sleep(0)
    # await websocket.send(
    #     json.dumps({"type": "heartbeat"})
    # )
    queue_protocol = QueueProtocol(websocket, task_manager)
    await queue_protocol.add_event("file_formats", get_formats, None)
    await queue_protocol.add_event("file_docs", get_documentation, None, group=True)
    await queue_protocol.create_handler()


async def main():
    async with serve(handler, "", 8001):
        print("What")
        # await asyncio.get_running_loop().create_future()  # run forever
        await asyncio.Future()
        print("What what")

if __name__ == "__main__":
    asyncio.run(main())