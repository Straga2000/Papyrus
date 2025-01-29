import re
from pyexpat import ExpatError

from lxml import etree

from helpers.transforms import transf_xml2json, transf_json2xml, doc2object
from json2xml.json2xml import Json2xml
from json2xml.dicttoxml import dicttoxml
import xmltodict

from core.llm import llm
from langchain_core.prompts import ChatPromptTemplate
from pprint import pprint
from xml.parsers.expat import ParserCreate, ExpatError, errors
from html import escape

result_json = {
        "documentation": {
            "block": [
                    {
                        "@attrs": {
                            "name": "Example",
                            "type": "class",
                            "description": "example class for the addition of two numbers",
                        },
                        "arguments": [{
                            "@attrs": {"name": "self", "type": "class"}
                        }, {
                            "@attrs": {"name": "arg1", "type": "int"},
                        }, {
                            "@attrs": {  "name": "arg2", "type": "int"}
                        }],
                        "return": ["none"],
                        "children": {
                            "block": [{
                                "@attrs": {
                                    "name": "a",
                                    "type": "method",
                                    "description": "method of adding two numbers",
                                },
                                "arguments": [{
                                    "@attrs": {"name": "fst_arg",
                                    "type": "int"}

                                }, {
                                    "@attrs": {
                                        "name": "snd_arg",
                                        "type": "int"
                                    }
                                }],
                                "return": ["int"],
                                "children": "None"
                            }]
                        }

                    },
                    {
                        "@attrs": {
                            "name": "example_operation",
                            "type": "function",
                            "description": "function applying the example class functionalities",
                        },
                        "arguments": [{
                            "@attrs": {
                                "name": "ex",
                                "type": "class"
                            }
                        }],
                        "return": ["int"],
                        "children": "None"
                    }
            ]
        }
}
new_elem = dicttoxml(result_json, root=False, attr_type=False).decode("utf-8").replace('<?xml version="1.0" encoding="UTF-8"?>', "")
# print(new_elem)
# print(new_elem)
# print(xmltodict.parse(new_elem))
# remove "item" from parsed tree

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
    print("What is the length of the given code?", len(code_sample))
#
code_example = None
with open("code_example", "r") as f:
    # code_sample = "\n".join([f"{idx}. {line}" for idx, line in enumerate(f.read().split("\n"))])
    code_example = f.read()
    # print(code_example.encode("ascii"))

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
    ("ai", "The documentation for the given code:\n```xml\n<documentation>")
])
#
# example_block = Json2xml(result_json,
#                          root=False,
#                          item_wrap=False,
#                          attr_type=False,
#                          pretty=True).to_xml().replace('<?xml version="1.0" encoding="UTF-8"?>', "")
# example_block = f"```xml\n{example_block}```"

# print("Started the documentation process")
res = (documentation_context | llm).invoke({
    "example": code_example,
    "result": new_elem,
    "sample": code_sample,
    "file_type": "c++",
})
res= "<documentation>" + res.content
res = res.split("```")[0]
res = res.replace('<?xml version="1.0" encoding="UTF-8"?>', "")
print("Before parsing", res)

parser = etree.XMLParser(encoding="utf-8", recover=True)
res = etree.fromstring(res, parser=parser)
res = etree.tostring(res, encoding='UTF-8', xml_declaration=False)
print("After parsing", res)
res = xmltodict.parse(res)
# while True:
#     try:
#
#         res = parsed
#         break
    # except ExpatError as e:
    #     line_number = e.lineno
    #     column_number = e.offset
    #     extracted_line = res.split("\n")[line_number - 1]
    #     print(e)
    #     print(extracted_line)
    #     res_err = (error_prompt | llm).invoke({
    #         "XML": extracted_line,
    #         "ERROR": errors.messages[e.code]
    #     })
    #     print(res_err.content)
    #     new_line = res_err.content.split("```")[0]
    #     res = res.replace(extracted_line, new_line)
    #     # res = "<documentation>" + res.content
    #     # res = res.split("```")[0]
    #     # res = res.replace('<?xml version="1.0" encoding="UTF-8"?>', "")

def dict2object(elem):
    # we need to clean up the structure first
    key_transform = lambda key: key.replace("@", "")
    none_transform = lambda value: None if (isinstance(value, str) and value.lower().find("none") != -1) or None else value

    if isinstance(elem, dict):
        # transform any key from @(attr) to normal key
        elem = {key_transform(key): none_transform(elem[key]) for key in elem}

        # prune redundant information here
        if elem.get("documentation"):
            return dict2object(elem["documentation"])
        if elem.get("item"):
            return dict2object(elem["item"])

        if elem.get("children") and isinstance(elem["children"], dict):
            elem["children"] = elem["children"].get("block")

        if elem.get("block") and isinstance(elem["block"], dict):
            elem["block"] = [elem["block"]]

        if elem.get("arguments") and isinstance(elem["arguments"], dict):
            elem["arguments"] = [elem["arguments"]]

        if elem.get("return") and isinstance(elem["return"], dict):
            elem["return"] = [elem["return"]]


        new_elem = {key: dict2object(elem[key]) for key in elem}

        # for found_key in ["block", "children"]:
        #     new_blocks = []
        #
        #     if not new_elem.get(found_key):
        #         continue
        #
        #     for block in new_elem.get(found_key, []):
        #         name = block.get("name")
        #         type = block.get("type")
        #         description = "Whatever to see if it works"
        #         return_value = block.get("return", None)
        #         if not name:
        #             continue
        #         new_blocks.append({
        #             "name": name,
        #             "type": type,
        #             "description": description,
        #             "return": return_value,
        #             "children": block.get("children")
        #         })
        #     new_elem[found_key] = new_blocks


        return new_elem

    if isinstance(elem, list):
        return [dict2object(val) for val in elem]

    # now get the blocks
    print("Goes on default", elem)
    return none_transform(elem)


# now simplify response
print("Finished simplified response", dict2object(res))

#
# print("Finished the documentation process")
# print(res)
# print(res.content)
# print(res.response_metadata.get("done_reason"))
#
# documentation = transf_xml2json(res.content.replace("```", ""))
# print("Documentation after json transform",documentation)
#
# # format documentation
# documentation = doc2object(documentation)
# pprint(documentation)
# done
