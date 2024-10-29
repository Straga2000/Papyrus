from json2xml.json2xml import Json2xml
from helpers.transforms import transf_json2xml


def get_file_parameters():
    ai_example = transf_json2xml({
        "table": [
            {
            "index": 1,
            "code": "false",
            "language": "Cascading Style Sheets",
            # "document": "false",
            "type": "text",
            },
            # {
            # "index": 2,
            # "code": "false",
            # "language": "none",
            # "type": "text",
            # },
            {
            "index": 2,
            "code": "false",
            "language": "Portable Network Graphics",
            # "document": "false",
            "type": "image",
            },
            {
            "index": 3,
            "code": "true",
            "language": "Javascript",
            # "document": "true",
            "type": "text",
            },
            {
            "index": 4,
            "code": "false",
            "language": "Hypertext Markup Language",
            # "document": "false",
            "type": "text",
            },
        ]
    })

    # if the file contains code or not (true / false)
    human_transform = lambda x: f"LIST OF FILE FORMATS: \n" + "\n".join([f"{idx + 1}. {elem}" for idx, elem in enumerate(x)])
    context = [("system", "Yor task is to complete a table using some given file formats. The table should contain "
                          "index, if it is code or not (true for object-oriented programming or functional programming. false for markup languages), type (text OR image), language (full name)."),
     ("human", human_transform(["css", "png", "js"])),
     ("ai", f"```xml{ai_example}```"),
     ("human", "{input}"),
     ("ai", "```xml")]
    return context, human_transform

def get_file_documentation():
    example_answer = {
        "documentation": {
            "block": [
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
        }
    }

    example_block = Json2xml(example_answer,
                             root=False,
                             item_wrap=False,
                             attr_type=False,
                             pretty=False).to_xml()
    example_block = example_block.decode("utf-8").replace('<?xml version="1.0" encoding="UTF-8"?>', "")
    example_block = f"```xml\n{example_block}```"

    code_example = "from module.file import used_function\nclass Example:\n    def __init__(self, arg1, arg2):\n        self.arg1, self.arg2 = arg1, arg2\n\n    def a(self, fst_arg, snd_arg):\n        return fst_arg + snd_arg\n\n\ndef example_operation(ex):\n    return ex.a(ex.arg1, ex.arg2)\n\ncls_ex = Example(4, 5)\nprint(example_operation(cls_ex))"
    documentation_context = [
        ("system",
         "You are an expert software developer. Your task is to create a table documenting a {file_type} file content without the commented code."
         "\nThe documentation should include:"
         "\n\t- block name (string)"
         "\n\t- description (string)"
         "\n\t- block type (string)"
         "\n\t- arguments (a list of arguments names and types) if available, otherwise none"
         "\n\t- return (list of return types) if available, otherwise none"
         "\n\t- children (inner blocks)"
         "\nThe documentation should ignore the commented code. If blocks appear multiple times, they are global elements and should not appear as children of other blocks. Always respect the given XML format, do not forget to enclose tags."),
        ("human", f"{code_example}"),
        ("ai", f"{example_block}"),
        ("human", "{input}"),
        ("ai", "```xml\n<documentation>")
    ]
    # sometimes, contexts use a formatter for the input of the context; this context doesnt need any
    return documentation_context, None

def get_file_summary():
    summary_context = [
        ("system",
         "You are an expert writer. Your task is to summarize what the {file_type} file is used for "
         "and what information contains. The answer should be clear, professional and containing relevant information. Please write the answer in the markdown language."),
        ("human", "{input}"),
    ]
    # sometimes, contexts use a formatter for the input of the context; this context doesnt need any
    return summary_context, None