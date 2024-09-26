import requests
from tasks.queue import task_manager
from core.llm import llm
from langchain_core.prompts import ChatPromptTemplate


@task_manager.task(ignore_result=False)
def get_text_file(url):
    response = requests.get(url)
    # print(f"A response with content type of {response.headers['content-type']}")
    if response and response.headers["content-type"].find("text") == 0:
        return response.text
    return None

# we need to create a function that gets the code, then we need to structure the classes, the functions, etc
# how do we do this reliably? (extract function signatures)

@task_manager.task(ignore_result=False)
def get_answer(params):
    sum_test = ChatPromptTemplate.from_messages([
        ("human", "You are a math savvy with a lot of information in algebra. Given two numbers in the algebraic ring on Z13, what is {value1} + {value2}?")
    ])
    sum_test = sum_test | llm
    return  sum_test.invoke(params).content


# we need to create a task that get the file formats

# also, we need to create a task that makes hierarchy, makes whatever, etc