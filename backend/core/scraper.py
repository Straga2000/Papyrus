import re

from bs4 import BeautifulSoup, Comment, NavigableString, element


class Scraper:

    @staticmethod
    def get_cleaned_body(html_text):
        content = BeautifulSoup(html_text, 'html.parser')

        # remove scripts and style
        for script_or_style in content(["script", "style"]):
            script_or_style.extract()

        # remove comments
        for elem in content.find_all(string=lambda text: isinstance(text, Comment)):
            elem.extract()

        # remove navigation/redundant elements
        for elem in content(["nav", "footer", "header"]):
            elem.extract()

        searched_elem = content.find("main")
        return searched_elem if searched_elem else content.find("body")

    @staticmethod
    def get_html_2_tree(root):
        if type(root) is element.Tag:
            # print(root.string)
            if len(list(root.children)) == 1:
                return Scraper.get_html_2_tree(list(root.children)[0])

            # we should check if all the children are navigable strings (check if the array doesnt contain another array)
            current_tree = [Scraper.get_html_2_tree(child) for child in root.children]
            current_tree = [child if isinstance(child, list) else re.sub("\s+", " ", child).strip() for child in
                            current_tree if child]

            if len(current_tree) == 1:
                return current_tree[0]

            return current_tree

        if type(root) is NavigableString:
            return root.get_text() if not re.fullmatch("\s+", root.text) else None

    @staticmethod
    def get_tree_2_string(root):
        if isinstance(root, str):
            return root

        all_str = all(isinstance(child, str) for child in root)
        if all_str:
            return " ".join(root)
        else:
            return "\n".join(
                [Scraper.get_tree_2_string(child) if not isinstance(child, str) else child for child in root])

    @staticmethod
    def get_html_2_string(html):
        html = Scraper.get_cleaned_body(html)
        tree = Scraper.get_html_2_tree(html)
        return Scraper.get_tree_2_string(tree)