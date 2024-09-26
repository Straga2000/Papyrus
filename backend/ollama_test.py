from celery import group

from core.documentor import Documentor
from helpers.transforms import file2format
from tasks.github import get_text_file

# https://github.com/Straga2000/Foodity
# https://github.com/pri1311/crunch/tree/master
# https://github.com/Straga2000/IntelliDoc
# https://github.com/sunface/rust-by-practice
# https://github.com/brionmario/php-starter
# https://github.com/tlk00/BitMagic/
# https://github.com/bchavez/Bogus
given_url = "https://github.com/Straga2000/IntelliDoc"

proj_str = Documentor.get_project_structure(given_url)
files = proj_str["files"]
tree = proj_str["tree"]
# get formats
formats = Documentor.get_files_format(files)
print(formats)

# now we map the formats to the files
def add_files_formats(files, formats):
    return { key: {"url": files[key],
              **formats[file2format(key)]
              } for key in files}

# print(*add_files_formats(files, formats).items(), sep="\n")

files = add_files_formats(files, formats)
files_list = list(files.keys())
print(files_list)

# now, we read the files (in the api, it should be done in the task manager, results will be received at a later time)
# each file will get chained with the documentation method
g = group([get_text_file.s(files[key].get("url")) for key in files_list])
res = g.apply_async(timeout=100)
res.save()
res_id = res.id

status_list = []
while not res.ready():
    new_status_list = [c.status for c in res.children]
    if new_status_list != status_list:
        print(sum([1 if elem == "SUCCESS" else 0 for elem in new_status_list]))
        status_list = new_status_list

res = res.get()
print(res[6])
print("---------------")
print(res[11])
print("---------------")
print(res[-1])
# print(*res.get(), sep="\n")
# now we need to create a prompt for the hierarchy of the file


# "role": "system",
#             "content": "You are an expert python software developer that needs to write the documentation for "
#                        "the python code. Nothing is impossible for you."
#                        " Write a xml list for every class and function containing the description, name of the "
#                        "class/function, parameters and the type of the returned value."
#                        "If requests "
#                        "are used, specify the usage of forms or json.",

from core.llm import llm
from langchain_core.prompts import ChatPromptTemplate

