import re

from decouple import config

from langchain_core.prompts import ChatPromptTemplate
from prompt_toolkit import pep440

from core.contexts import get_file_parameters, get_file_documentation
from core.llm import llm

from core.github import Github
from helpers.transforms import file2format, transf_xml2json, format2object, doc2object
from storage.redis_store import RedisStore


class Documentor:
    proj_struct_key = "project:structure"
    proj_list_key = "projects"
    format_list_key = "format"

    github_key = config('GITHUB_TOKEN', default='no_key')

    def __init__(self):
        pass

    @staticmethod
    def get_all_projects():
        projects = RedisStore.get(Documentor.proj_list_key)
        project_args_func = lambda x: {"name": x[0], "author": x[1]}
        return {
            "projects": [{
                "url": project,
                **project_args_func(Github.get_args(project))
            } for project in projects] if projects else []
        }

    @staticmethod
    def get_project_structure(url):
        name, author = Github.get_args(url)
        key = f"{Documentor.proj_struct_key}:{name}:{author}"

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
    def get_file_content(file):
        type = file.get("type")
        if type != "text":
            return {"content": "This file does not need any kind of documentation."}

        code = file.get("code")
        if not code:
            return Documentor.get_file_summary(file)

        return Documentor.get_file_documentation(file)


    @staticmethod
    def get_file_documentation(file):
        # extract the documentation using the documentation context, then apply the transform
        # to obtain a stable structure; save the obtained structure into ChromeDB for later use in task completion
        documentation_context = get_file_documentation()
        documentation_creator = ChatPromptTemplate.from_messages(documentation_context)
        documentation_creator = documentation_creator | llm
        res = documentation_creator.invoke({
            "input": file
        })
        # remove the bits and pieces of the answer format
        res = res.content.split("```")[0]
        res = transf_xml2json(res)
        documentation = doc2object(res)
        #TODO save a short description of the file based on the concat of blocks for chroma so we can use the in tasks
        return {"content": documentation}

    @staticmethod
    def get_file_summary(file):
        # we know that the file contains text, we just need a simple summary for the file
        return {"content": "Description for file"}