import base64
import json
import re
from io import BytesIO

import requests
from decouple import config
from dns.dnssec import key_id
from langchain_core.messages import HumanMessage

from langchain_core.prompts import ChatPromptTemplate
from prompt_toolkit import pep440

from core.contexts import get_file_parameters, get_file_documentation, get_file_summary
from core.llm import llm, llm_image

from core.github import Github
from helpers.transforms import file2format, transf_xml2json, format2object, doc2object, text2chunks
from storage.redis_store import RedisStore
from core.scraper import Scraper
from storage.chroma_store import VectorCollection

class Documentor:
    proj_struct_key = "project:structure"
    proj_list_key = "projects"
    format_list_key = "format"
    web_sources_key = "sources"
    doc_sources_key = "doc_sources"
    github_key = config('GITHUB_TOKEN', default='no_key')


    def __init__(self):
        pass

    @staticmethod
    def get_all_projects():
        projects = RedisStore.get(Documentor.proj_list_key)
        print("These are the available projects", projects)
        if projects:
            return projects

        projects = {
            "projects": [{
                "url": project,
                **Documentor.get_project_meta(project)
            } for project in projects] if projects else []
        }
        # RedisStore.set(Documentor.proj_list_key, projects)
        return projects

    @staticmethod
    def add_project(url):
        projects = RedisStore.get(Documentor.proj_list_key)
        new_project = {
            "url": url,
            **Documentor.get_project_meta(url)
        }

        projects = {
            "projects": [*projects["projects"], new_project] if projects else [new_project]
        }
        RedisStore.set(Documentor.proj_list_key, projects)
        print(projects)
        return True


    @staticmethod
    def get_project_meta(url):
        owner, repo = Github.get_args(url)
        return {"name": repo, "author": owner}

    @staticmethod
    def get_project_structure(url):
        name, author = Github.get_args(url)
        key = f"{Documentor.proj_struct_key}:{name}:{author}"
        print(key)

        project_structure = RedisStore.get(key)
        if not project_structure:
            # see if the project already exists in redis, else apply github elements
            github_api = Github(url, Documentor.github_key)
            tree = github_api.fetch_files(f"{name}/{author}")
            files = github_api.file_dict
            project_structure = {
                "tree": tree,
                "files": files
            }
            RedisStore.set(key, project_structure)
            # also set the loaded project here
            Documentor.add_project(url)

            # ensure existence or creation of formats for the files
            # (the task can be added in queue and send later through a websocket)
        return project_structure

    @staticmethod
    def get_formats(file_list):
        format_list = list(set(file2format(file) for file in file_list))
        return format_list

    @staticmethod
    def get_files_format(files):

        #TODO something wrong with logic, repair here
        formats = Documentor.get_formats([file for file in files.keys()])
        print("Initial formats", formats)

        # get the file formats; if some remain use the llm to get the format description
        format_dict = {format_name: RedisStore.get(f"{Documentor.format_list_key}:{format_name}") for format_name in formats}
        format_dict = {key: format_dict[key] for key in format_dict if format_dict[key]}
        print("Formats already existing in the database\n" + "\n".join(f"{key}: {format_dict[key]}" for key in format_dict))

        # find the formats that miss
        diff_formats = [key for key in format_dict if format_dict[key]]

        print("Formats already existing", diff_formats)
        formats = list(set(formats).difference(diff_formats))

        print("Later formats", formats)
        update_formats = {}
        if len(formats) != 0:
            file_context, human_transform = get_file_parameters()
            prompt_file_verifier = ChatPromptTemplate.from_messages(file_context)
            file_verifier = prompt_file_verifier | llm

            res = file_verifier.invoke({
                "input": human_transform(formats)
            })
            res = re.sub('(^(```xml)|(```))', "", res.content)
            res = transf_xml2json(res)
            print("THIS IS THE NEW JSON RESULT\n", res)

            res = res.get("table", {}).get("item", [])
            #TODO add defaults for fields

            # set the needed formats
            update_formats = {format_name: format2object(format_dict) for format_name, format_dict in zip(formats, res)}

            # update storage
            for format_name in update_formats:
                RedisStore.set(f"{Documentor.format_list_key}:{format_name}", update_formats[format_name])

        #TODO check if all the formats were found
        format_dict = {**format_dict, **update_formats}
        print(format_dict)
        return format_dict

    @staticmethod
    def get_file_with_formats(url):
        files = Documentor.get_project_structure(url)["files"]
        files = {key: {"url": files[key], "format": file2format(key)} for key in files.keys()}
        return files


    @staticmethod
    def get_file_content(file, regenerate=False):
        url = file.get("url")
        # check if it was save into chroma
        sources = VectorCollection(Documentor.doc_sources_key)
        found_data = sources.exist_by_metadata({"url": url})
        docs = found_data.get("documents", [])

        if not regenerate and len(docs) != 0 and json.loads(docs[0]).get("content"):
            return json.loads(docs[0])
        else:
            regenerate = True

        # if le not json.loads(docs[0]).get("content"):
        #     regenerate = True

        # if not regenerate:
        #     # check if there are any documents available
        #     if len(found_data) != 0:
        #         found_data = json.loads(found_data.get("documents")[0])
        #         if not found_data.get("content"):
        #
        #
        #         # return data after unpacking
        #         return

        type = file.get("type")
        if not type or type.find("image") != -1:
            print("What is the type of file?", file)
            file_data = requests.get(url)
            print(dict(file_data.headers))

            img_str = base64.b64encode(file_data.content).decode("utf-8")
            multi_context = [HumanMessage(content=[
                {
                    "type": "image_url",
                    "image_url": f"data:{file_data.headers['Content-Type']};base64,{img_str}"
                },
                {
                    "type": "text",
                    "text": "Create a description of the given photo."
                }
            ])]

            res = llm_image.invoke(multi_context)
            print(f"Result for image description {res}")

            obtained_file = {**file, "content": res.content}
            if not regenerate or not found_data.get("ids"):
                sources.add([{
                    "data": json.dumps(obtained_file),
                    "metadata": {"url": url},
                }])
            else:
                print("Enter on update")
                sources.update([{
                    "data": json.dumps(obtained_file),
                    "metadata": {"url": url},
                    "id": found_data.get("ids")[0]
                }])

            return obtained_file

        if type != "text":
            print("What is the type of file?", file)
            return {**file, "content": "This file does not need any kind of documentation."}

        code = file.get("code")

        # file retrieval
        file_text = requests.get(url)
        if file_text and file_text.headers["content-type"].find("text") == 0:
            file_text = file_text.text

        file = {**file, "content": file_text}
        documented_file = Documentor.get_file_summary(file) if not code else Documentor.get_file_documentation(file)
        file = {**file, **documented_file}

        # save to chroma
        # we should create the ids based on the url
        if not regenerate:
            sources.add([{
                "data": json.dumps(file),
                "metadata": {"url": url},
            }])
        else:
            sources.update([{
                "data": json.dumps(file),
                "metadata": {"url": url},
                "id": found_data.get("ids")[0]
            }])

        return file


    @staticmethod
    def get_file_documentation(file):

        # check if the documentation for this file already exists (i think chroma should be the way to save the data)
        #  sources_collection = VectorCollection("sources")
        #         sources_collection.add([
        #             {
        #                 "metadata": {"url": url},
        #                 "data": chunk
        #             } for chunk in chunks])


        # extract the documentation using the documentation context, then apply the transform
        # to obtain a stable structure; save the obtained structure into ChromeDB for later use in task completion
        documentation_context, _ = get_file_documentation()
        documentation_creator = ChatPromptTemplate.from_messages(documentation_context)
        documentation_creator = documentation_creator | llm
        res = documentation_creator.invoke({
            "input": file.get("content"),
            "file_type": file.get("type")
        })
        # remove the bits and pieces of the answer format
        res = "<documentation>" + res.content
        res = res.split("```")[0]
        res = res.replace('<?xml version="1.0" encoding="UTF-8"?>', "")
        print("This is the original response", res)

        try:
            res_json = transf_xml2json(res)
        except Exception as e:
            print("Cannot transform to json", res)
            return {"content", res}

        try:
            documentation = doc2object(res_json)
        except Exception as e:
            return {"content": res_json}
        #TODO save a short description of the file based on the concat of blocks for chroma so we can use the in tasks
        return {"content": documentation}

    @staticmethod
    def get_file_summary(file):
        summary_context, _ = get_file_summary()
        summary_creator = ChatPromptTemplate.from_messages(summary_context)
        summary_creator = summary_creator | llm
        res = summary_creator.invoke({
            "input": file.get("content"),
            "file_type": file.get("type")
        })
        # we know that the file contains text, we just need a simple summary for the file
        return {"content": res.content}

    @staticmethod
    def set_web_source(url):
        html_text = requests.get(url)
        html_text = Scraper.get_html_2_string(html_text)
        chunks = text2chunks(html_text)
        # split to chunks here
        sources_collection = VectorCollection("sources")
        sources_collection.add([
            {
                "metadata": {"url": url},
                "data": chunk
            } for chunk in chunks])
        return chunks

    @staticmethod
    def get_web_sources(texts, results=3):
        sources_collection = VectorCollection(Documentor.web_sources_key)
        query = sources_collection.query(*texts, n_results=results)

        ordered_sources = []
        for docs, distances in zip(query.get("documents"), query.get("distances")):
            # distance > 1.8, then texts unrelated
            if sum(distances) / len(distances) > 1.8:
                ordered_sources.append(None)
            ordered_sources.append(docs)

        return ordered_sources