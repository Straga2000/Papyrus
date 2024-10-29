import re

import requests
from langchain_core.prompts import ChatPromptTemplate

# from storage.chroma_store import VectorCollection
from core.llm import llm

# web_info = VectorCollection("web-info")

# get a site page here
# url = "https://carrefour.ro/electrocasnice-mici-si-bucatarie/electrocasnice-bucatarie"
# url = "https://en.wikipedia.org/wiki/Abstract_algebra"
# url = "https://www.geeksforgeeks.org/generators-in-python/#:~:text=A%20generator%20function%20in%20Python,becomes%20a%20Python%20generator%20function."
url = "https://cybertech.ro/"
res = requests.get(url)
# print(res.text)
from bs4 import BeautifulSoup, Comment, NavigableString, element

soup = BeautifulSoup(res.text, 'html.parser')

title = soup.title.text

# remove scripts and style
for script_or_style in soup(["script", "style"]):
    script_or_style.extract()

# remove comments
for elem in soup.find_all(string=lambda text: isinstance(text, Comment)):
    elem.extract()

# remove navigation/redundant elements
for elem in soup(["nav", "footer", "header"]):
    elem.extract()

# print(title)

# check what can we find (if we find body, then we read the body, if we find main, use main)
# search_elem = soup.find("main")
# if search_elem:
#     soup = BeautifulSoup(str(search_elem), "html.parser")
# else:
# soup = BeautifulSoup(str(soup.find("body")), "html.parser")
searched_elem = soup.find("main")
searched_elem = searched_elem if searched_elem else soup.find("body")


# print(soup.prettify())
# body = str(soup.body)
# print("This is the body", body)

# soup = BeautifulSoup(body, "lxml")
# print(searched_elem)


# remove navigation




# print(soup.prettify())
# print(*list(soup.findChildren()), sep="\n\n--------------------SEPARATOR--------------------\n\n")
def render_list_tree(root, sep_num = 0):
    if isinstance(root, str):
        return root

    all_str = all(isinstance(child, str) for child in root)
    if all_str:
        # print("All str ", root)
        # then we just concatenate the level with leaves (before the recursion, not after)
        # "\t" * (sep_num - 1) +
        return " ".join(root)
    else:
        # if not all of them are strings:
        # we add for the strings \n + \t * sep_num
        # "\t" * sep_num +
        return "\n".join([render_list_tree(child, sep_num + 1) if not isinstance(child, str) else child for child in root])


def html_tree_2_list(root):

    if type(root) is element.Tag:
        # print(root.string)
        if len(list(root.children)) == 1:
            return html_tree_2_list(list(root.children)[0])

        # we should check if all the children are navigable strings (check if the array doesnt contain another array)
        current_tree = [html_tree_2_list(child) for child in root.children]
        current_tree = [child if isinstance(child, list) else re.sub("\s+", " ", child).strip() for child in current_tree if child]


        # once more op
        # check_for_array = any(isinstance(child, list) for child in current_tree)
        # if not check_for_array:
        #     return "\t" * sep_num + " ".join(current_tree)


        # current_tree = "\n".join(current_tree)
        if len(current_tree) == 1:
            return current_tree[0]

        return current_tree

    if type(root) is NavigableString:
        return root.get_text() if not re.fullmatch("\s+", root.text) else None

    # print("Out of the tag if", type(root))

    # print(len(root.children))

    # if isinstance(root, NavigableString):
    #     print("Nav text string", len(list(root.strings)))
    #     return [elem for elem in root.strings]
    #
    # if len(list(root.children)) == 1:
    #     return html_tree_2_list(list(root.children)[0])
    # else:
    #     return [child.name for child in root.children]


    # if type(root) is element.Tag:
    #     return root.get_text()
    # else:
    #     return [html_tree_2_list(child) for child in root.children]

    # try:
    #     if len(list(root.children)) == 1:
    #         print("It doesnt")
    #         return html_tree_2_list(list(root.children)[0])
    #     else:
    #         print("It has children")
    # except AttributeError as e:
    #     print("It s just text")
    #     return str(root.encode("utf-8"))
# print(type(list(list(soup.children)[0])), type(soup))
print("asfdfghn")
# print(type(soup), type(soup.find("body")))
tree_list = html_tree_2_list(searched_elem)
tree_list = render_list_tree(tree_list)
# print(tree_list)
# print(len(tree_list))

# function to split content

print(tree_list)


extractor_context = [
        ("system", "You are tasked with extracting all the useful information from this webpage:\n{input}\n"
                   "\n\nSome rules you should follow:"
                   "\nData structuring: If any piece of information can be structured into a list, a table, etc., "
                   "please use one of those formats."
                   "\nData importance: Based on the page text subject, you should select those piece of information "
                   "that are closest related to the page theme."
                   "\nUsed language: Please translate any text you read in english."
                   "\nResponse structure: It is very important to write the useful information into a simple, digestible format in english. Use the markdown language."),
        ("human", "Please extract the info."),
        ("ai", "```markdown\n")
]

extractor_context = ChatPromptTemplate(extractor_context) | llm

def split_dom_content(dom_content, max_length=4000):
    return [
        dom_content[i : i + max_length] for i in range(0, len(dom_content), max_length)
    ]


# sources_collection = VectorCollection("web-info")
# sources_collection.add([
#     {
#         "metadata": {"url": url},
#         "data": chunk
#     } for chunk in split_dom_content(tree_list)])
#
# for chunk in split_dom_content(tree_list):
#     res = extractor_context.with_config(configurable={"output_token_number": 4000}).invoke({
#         "input": chunk
#     })
#     print(res.content)
#     print("-------------------------------------")

# searched_texts = ["flower sky painting powerful", "group static algebra", "How are you today?"]
# found_objects = sources_collection.query(*searched_texts, n_results=3)
# print(found_objects)
# for elem in found_objects.get("documents")[0]:
#     print(elem)
