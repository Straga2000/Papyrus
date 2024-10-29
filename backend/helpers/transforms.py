import re

import xmltodict
from lxml import etree
from json2xml.json2xml import Json2xml
from sympy import pretty

parser = etree.XMLParser(recover=True)



def transf_json2xml(elem):
    # elem should be json / dict and have a single initial key
    if isinstance(elem, dict):
        # keys
        keys = [key for key in elem]
        if len(keys) == 1:
            return Json2xml(elem,
                            root=False,
                            item_wrap=True,
                            attr_type=False,
                            pretty=True).to_xml().replace('<?xml version="1.0" encoding="UTF-8"?>', "")
        else:
            return Json2xml(elem,
                            item_wrap=False,
                            attr_type=False,
                            pretty=True).to_xml().replace('<?xml version="1.0" encoding="UTF-8"?>', "")
    raise TypeError("No valid type was given for this operation to be performed")


def transf_xml2json(elem):
    if isinstance(elem, str):
        elem = etree.fromstring(elem, parser=parser)
        elem = etree.tostring(elem)
        elem = xmltodict.parse(elem)
        return elem

    raise TypeError("No valid type was given for this operation to be performed")


def file2format(file):
    format_func = lambda x: re.sub(
        "\?.+", "", x
    ).split("/")[-1].split(".")[-1]
    return format_func(file)

def format2object(format):
    # we verify with the "template" of the format object and if it's malformed, then we use defaults
    code = format.get("code", "false")
    language = format.get("language", "none")
    type = format.get("type", "text")
    # we also change string values to correct types
    code = True if code.lower() == "true" else False
    language = None if language.lower() == "none" else language
    type = type if type.lower() in ["text", "image"] else "text"

    if type != "text":
        return {"code": False, "language": None, "type": type}

    return {"code": code, "language": language, "type": type}

def doc2object(doc, root=True):
    # TODO update the transformer function
    if root:
        print("This is the received doc", doc)
        # get the inner info from doc
        doc = doc.get("documentation", {})

    blocks = doc.get("block")
    if isinstance(blocks, dict):
        # it means it s just one block
        blocks = [blocks]
    # now, we operate on a list of blocks

    modified_blocks = []
    for block in blocks:
        name = block.get("name")
        type = block.get("type")
        desc = block.get("description")
        arg = block.get("arguments")
        if arg and isinstance(arg, str):
            arg = None

        if arg and isinstance(arg, dict):
            arg = [arg]

        if arg:
            arg = [{
                "name": arg_elem.get("name"),
                "type": arg_elem.get("type")
                    } for arg_elem in arg if arg_elem]
        return_val = block.get("return")

        # as in blocks, we should transform children into a list (use recursion)
        children = block.get("children", "none")
        if isinstance(children, str) and children.lower() == "none":
            children = None

        if children:
            # then recursion
            children = doc2object(children, root=False)

        modified_blocks.append({
            "name": name,
            "type": type,
            "description": desc,
            "args": arg,
            "return": return_val,
            "children": children
        })
    return modified_blocks


def text2chunks(text, max_length=4000):
    return [
        text[i : i + max_length] for i in range(0, len(text), max_length)
    ]

# print(transf_json2xml({
#     "table": {
#         "name.css": {
#         "code": True,
#         "lang": "css",
#         "type": "text"},
#         "description.txt": {
#         "code": False,
#         "lang": None,
#         "type": "text"},
#         "cute_dog.png": {
#         "code": False,
#         "lang": None,
#         "type": "image"}
#     }
# }))
# print(transf_xml2json(str(transf_json2xml({
#     "table": {
#         "name.css": {
#         "code": True,
#         "lang": "css",
#         "type": "text"},
#         "description.txt": {
#         "code": False,
#         "lang": None,
#         "type": "text"},
#         "cute_dog.png": {
#         "code": False,
#         "lang": None,
#         "type": "image"}
#     }
# }))))