# from celery import group
# from tasks.github import get_answer
#
# g = group([get_answer.s({
#     "value1": i,
#     "value2": i
# }) for i in range(20)])
# res = g.apply_async(timeout=100)
# res.save()
# res_id = res.id
#
# status_list = []
# while not res.ready():
#     new_status_list = [c.status for c in res.children]
#     if new_status_list != status_list:
#         print(sum([1 if elem == "SUCCESS" else 0 for elem in new_status_list]))
#         status_list = new_status_list
# print(*res.get(), sep="\n")


# g = group([get_text_file.s(files[key]) for key in files])
# res = g.apply_async(timeout=10)
# res.save()
# res_id = res.id
#
#
# while True:
#     if res.ready():
#         print(res.get())
#         break
#     else:
#         print("not ready")


#!/usr/bin/env python

# import asyncio
# import json
#
# from websockets.asyncio.server import serve
# from tasks.queue import task_manager
#
# async def handler(websocket):
#     async for message in websocket:
#         event = json.loads(message)
#
#         # read the event to call the celery method and cal fib
#         type = event.get("type")
#
#         if type == "calc":
#             # we init the calculation
#             value = event.get("val")
#             task = calc_fib.delay(value)
#             await websocket.send(json.dumps({"type": "fib", "id": task.id}))
#         elif type == "fib":
#             # this means we wait for fib to be calculated (check if celery finished the job)
#             fib_id = event.get("id")
#             task = task_manager.AsyncResult(fib_id)
#             print("This is the task", task, task.ready())
#
#
#             res = {"type": "result", "result": task.get() if task.ready() else None}
#             await websocket.send(json.dumps(res))
#         else:
#             await websocket.send(json.dumps({"type": "not-found"}))
#
#
# async def main():
#     async with serve(handler, "", 8001):
#         await asyncio.get_running_loop().create_future()  # run forever
#
#
# if __name__ == "__main__":
#     asyncio.run(main())

import json
from decouple import config
from flask import Flask, request, Response
from flask_cors import CORS
from config.flask import *
from core.documentor import Documentor
from core.github import Github
from storage.redis_store import RedisStore
import requests
from urllib.parse import quote, urlencode


def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)
    CORS(app, resources={r"/*": {"origins": "*"}})
    return app


def init():
    debug = config('DEBUG', default=True, cast=bool)
    get_config_mode = 'Debug' if debug else 'Production'

    try:
        # Load the configuration using the default values
        app_config = config_dict[get_config_mode.capitalize()]
    except KeyError:
        raise Exception('Error: Invalid <config_mode>. Expected values [Debug, Production] ')

    app = create_app(app_config)
    return app, app_config


if __name__ == "__main__":
    app, config = init()


    @app.route("/")
    def index():
        return "up"


    @app.route("/project/list/", methods=["GET", "POST"])
    def get_all_projects():
        # to get all projects, they should be put in a true database (eventually)
        projects = RedisStore.get("projects")
        project_args_func = lambda x: {"name": x[0], "author": x[1]}
        return {
            "status": True,
            "projects": [{
                "url": project,
                **project_args_func(Github.get_args(project))
            } for project in projects] if projects else []
        }


    @app.route("/project/structure/", methods=["GET", "POST"])
    def get_project_structure():
        # get project structure as a task if possible
        url = request.json.get("url")

        pass



    @app.route("/project/", methods=["GET", "POST"])
    def get_project():
        # we need to create documentation
        # 1. get types of files
        # 2. read every file from the project
        # 3. make hierarchy for every file (class, functions, methods, other structures)
        url = request.json.get("url")
        try:
            generated_documentation = doc_gen.generate_documentation(url)
            print(generated_documentation)
            projects = RedisStore.get("projects")
            if projects:
                projects = list(set([url, *projects]))
                RedisStore.set("projects", projects)
            else:
                RedisStore.set("projects", [url])

            return {
                "status": True,
                "project": generated_documentation,
                "name": doc_gen.name,
                "author": doc_gen.author,
            }
        except Exception as e:
            print(e)
            return {
                "status": False
            }



    # @app.route("/task/resolve/", methods=["GET", "POST"])
    # def resolve_task():
    #     project_url = request.json.get("project")
    #     task = request.json.get("task")
    #     print(f"Link: {project_url} Task: {task}")
    #
    #     def stream_task(task, project_url):
    #         enriched_task, is_complex = doc_gen.enrich_task(task)
    #         yield json.dumps({
    #             "continue": is_complex,
    #             "answer": "\n".join([f"{idx}. " + task_item for idx, task_item in enumerate(enriched_task)])
    #         }).encode("utf-8")
    #
    #         if is_complex:
    #             doc_gen.generate_documentation(project_url)
    #             solution = doc_gen.resolve_task(enriched_task)
    #             yield json.dumps({
    #                 "continue": False,
    #                 "answer": solution
    #             }).encode("utf-8")
    #
    #     # TODO optimize structure, make the structure of computing independent by the class
    #     return Response(stream_task(task, project_url), mimetype='text/event-stream')
    #
    # @app.route("/task/send/", methods=["GET", "POST"])
    # def send_task_as_issue():
    #     project_url = request.json.get("url")
    #     content = request.json.get("content")
    #
    #     solution_text = content.get('solution', {}).get('text', '')
    #     body_text = ""
    #     # refine the content
    #     body_text += f"## TASK\n*{content.get('task', '')}*\n\n"
    #     body_text += f"## TASK PLAN\n{content.get('plan', 'No plan realized for this task')}\n\n"
    #     body_text += f"## SOLUTION\n"
    #     body_text += solution_text + "\n" if solution_text else ""
    #     body_text += "\n".join([f"### Snippet #{idx}\n```{code.get('language')}\n{code.get('content')}\n"
    #                             for idx, code in enumerate(content.get('solution', {}).get('code', []))])
    #
    #     response_value = github_api.post_issue(project_url, "CodeX suggestion", body_text)
    #     return {"status": response_value}
    #
    # app.run(debug=True, use_reloader=False, host="0.0.0.0", port=8080)
