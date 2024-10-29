# from celery import group
# from tasks.github import get_answer
#


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
from crypt import methods

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
        return {
            "status": True,
            **Documentor.get_all_projects()
        }


    @app.route("/project/structure/", methods=["GET", "POST"])
    def get_project_structure():
        # get project structure as a task if possible
        url = request.json.get("url")
        print("this is the url")
        try:
            if not url:
                raise Exception("No url was given")

            project_structure = Documentor.get_project_structure(url)
            meta = Documentor.get_project_meta(url)
            return {
                "status": True,
                **project_structure,
                **meta
            }
        except Exception as e:
            return {
                "status": False,
                "error": str(e)
            }

    @app.route("/project/file2format/", methods=["GET", "POST"])
    def get_files_with_format():
        url = request.json.get("url")
        files = Documentor.get_file_with_formats(url)
        try:
            # lets do everything in backend (we know we got the structure and the formats, they just need to be combined)
            return {
                "status": True,
                "files": files
            }
        except Exception as e:
            return {
                "status": False,
                "error": str(e)
            }

    @app.route("/project/documentation/", methods=["GET", "POST"])
    def get_file_documentation():
        # try:
        file = request.json.get("file")
        regenerate = request.json.get("regenerate", False)
        documentation = Documentor.get_file_content(file, regenerate)
        return {
            "status": True,
            "documentation": documentation
        }
        # except Exception as e:
        #     return {
        #         "status": False,
        #         "error": str(e)
        #     }

    # @app.route("/project/", methods=["GET", "POST"])
    # def get_project():
    #     # we need to create documentation
    #     # 1. get types of files
    #     # 2. read every file from the project
    #     # 3. make hierarchy for every file (class, functions, methods, other structures)
    #     url = request.json.get("url")
    #     try:
    #         generated_documentation = Documentor.get_project_structure(url)
    #         print(generated_documentation)
    #         projects = RedisStore.get("projects")
    #         if projects:
    #             projects = list(set([url, *projects]))
    #             RedisStore.set("projects", projects)
    #         else:
    #             RedisStore.set("projects", [url])
    #
    #         return {
    #             "status": True,
    #             "project": generated_documentation,
    #             "name": doc_gen.name,
    #             "author": doc_gen.author,
    #         }
    #     except Exception as e:
    #         print(e)
    #         return {
    #             "status": False
    #         }



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
app.run(debug=True, use_reloader=False, host="0.0.0.0", port=8080)
