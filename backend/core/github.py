import requests
from decouple import config
import re
class Github(object):
    def __init__(self, path, token=""):
        self.token = token
        self.base_url = "https://api.github.com"
        self.file_dict = {}
        self.owner, self.repo  = self.get_args(path)
        self.project_url = f"{self.base_url}/repos/{self.owner}/{self.repo}/contents/"

    # we should resolve the extractor for the link
    @staticmethod
    def get_args(path):
        path = path.replace("https://github.com/", "").split("/")
        return path[0], path[1]

    def get_project(self):
        return f"{self.owner}/{self.repo}"

    def get_content(self, content_url):
        headers = {'Authorization': f'token {self.token}'}
        response = requests.get(content_url, headers=headers)
        response.raise_for_status()
        try:
            response = response.json()
        except Exception as e:
            print("Error on conversion to json of the response")
            return None
        return response


    def fetch_files(self, root_path, file=None, refresh=False):
        if not file:
            file = {
                "type": "dir",
                "path": "",
                "url": f"{self.base_url}/repos/{root_path}/contents/"
            }

        if file["type"] == "file":
            self.file_dict[file["url"]] = file["download_url"]
            return {"key": file["url"], "type": "str", "name": file.get("name", "")}

        elif file["type"] == "dir":
            fetched_files = self.get_content(file['url'])
            # add files to the list
            elem_list = [self.fetch_files(elem['url'], elem) for elem in fetched_files]
            return {"content": elem_list, "key": file['url'], "type": "dict", "name": file.get("name", "")}
        else:
            raise Exception(f"Not a file or dict: {file['type']}")

    # def fetch_files(self, path, content=None):
    #     # we should save the tree of ids
    #     if not content:
    #         content = {
    #
    #         }



    def post_issue(self, path, title, body):
        headers = {'Authorization': f'Bearer {self.token}',
                   "Accept": "application/vnd.github+json"}

        payload = {
            "title": title,
            # "assignee": None,
            # "milestone": None,
            "labels": ["enhancement"],
            # "assignees": [],
            "body": body
        }

        owner = self.get_author(path)
        repo = self.get_name(path)
        print(owner, repo)
        url = f"{self.base_url}/repos/{owner}/{repo}/issues"

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return True
        except Exception as e:
            raise e

    def get_issue(self, path, issue_number):
        owner, repo = self.get_args(path)
        url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}"
        headers = {'Authorization': f'Bearer {self.token}', "Accept": "application/vnd.github+json"}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()


if __name__ == "__main__":
    given_url = "https://github.com/Straga2000/IntelliDoc"
    github_api = Github(given_url, config('GITHUB_TOKEN', default='no_key'))
    given_url = github_api.get_project()
    tree = github_api.fetch_files(given_url)
    print(tree)
    print(github_api.file_dict)