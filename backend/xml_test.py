import re

from helpers.transforms import transf_xml2json, transf_json2xml, doc2object
from json2xml.json2xml import Json2xml
from core.llm import llm
from langchain_core.prompts import ChatPromptTemplate
from pprint import pprint
result_json = {
    "documentation": {
        "block": [
                # {
                #     "name": "module.file",
                #     "type": "import",
                #     "description": "imported utilities",
                #     "arguments": [{
                #         "name": "module.file",
                #         "type": "file"
                #     }],
                #     "return": ["file"],
                # }, {
                {
                    "name": "Example",
                    "type": "class",
                    "description": "example class for the addition of two numbers",
                    "arguments": [{
                        "name": "self",
                        "type": "class"
                    }, {
                        "name": "arg1",
                        "type": "int"
                    }, {
                        "name": "arg2",
                        "type": "int"
                    }],
                    "children": {
                        "block": [{
                            "name": "a",
                            "type": "method",
                            "description": "method of adding two numbers",
                            "arguments": [{
                                "name": "fst_arg",
                                "type": "int"
                            }, {
                                "name": "snd_arg",
                                "type": "int"
                            }],
                            "return": ["int"],
                            "children": "None"
                        }]
                    }

                },
                {
                    "name": "example_operation",
                    "type": "function",
                    "description": "function applying the example class functionalities",
                    "arguments": [{
                        "name": "ex",
                        "type": "class"
                    }],
                    "return": ["int"],
                    "children": "None"
                }
        ]
    }}

# "Given a {file_type} file, generate comprehensive documentation in XML format focusing on the "
#                    "functionality and expected behavior of its blocks (classes, functions, imports, structures). Follow these steps:"
#                    "\n- Identify all blocks within the file, noting their names, parameters, and "
#                    "return types.\n- For each block, provide:\n\t- A brief description of its functionality. "
#                    "\n\t- Details of found inputs and outputs (name, type, description)."
#                    "\n- Organize the documentation according to the provided XML structure (IMPORTANT), ensuring each "
#                    "block is properly formatted. \n- Validate the XML to ensure it is well-formed "
#                    "and complete. \n- Do not analyze the internal code structure or include comments in the "
#                    "response.\nEXAMPLE XML STRUCTURE:\n{structure}\n"

code_sample = None
with open("code_sample", "r") as f:
    # code_sample = "\n".join([f"{idx}. {line}" for idx, line in enumerate(f.read().split("\n"))])
    code_sample = f.read()

code_example = None
with open("code_example", "r") as f:
    # code_sample = "\n".join([f"{idx}. {line}" for idx, line in enumerate(f.read().split("\n"))])
    code_example = f.read()
    print(code_example.encode("ascii"))

documentation_context = ChatPromptTemplate([
    ("system", "You are an expert software developer. Your task is to create a table documenting a {file_type} file content without the commented code."
               "\nThe documentation should include:"
               "\n\t- block name (string)"
               "\n\t- description (string)"
               "\n\t- block type (string)"
               "\n\t- arguments (a list of arguments names and types) if available, otherwise none"
               "\n\t- return (list of return types) if available, otherwise none"
               "\n\t- children (inner blocks)"
               "\nThe documentation should ignore the commented code. If blocks appear multiple times, they are global elements and should not appear as children of other blocks. Always respect the given XML format, do not forget to enclose tags."),
    ("human", "{example}"),
    ("ai", "{result}"),
    ("human", "{sample}"),
    ("ai", "```xml\n")
])

example_block = Json2xml(result_json,
                         root=False,
                         item_wrap=False,
                         attr_type=False,
                         pretty=True).to_xml().replace('<?xml version="1.0" encoding="UTF-8"?>', "")
example_block = f"```xml\n{example_block}```"

print("Started the documentation process")
res = (documentation_context | llm).invoke({
    "example": code_example,
    "result": example_block,
    "sample": code_sample,
    "file_type": "Java",
})

print("Finished the documentation process")
print(res)
print(res.content)
print(res.response_metadata.get("done_reason"))

documentation = transf_xml2json(res.content.replace("```", ""))
print("Documentation after json transform",documentation)

# format documentation
documentation = doc2object(documentation)
pprint(documentation)
# done
