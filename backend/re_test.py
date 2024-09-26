import re

import xmltodict
from lxml import etree

with open("./test") as t:
    text = t.read()
    elem = re.sub('(^(```xml)|(```))',"", text)
    print("This is the elem", elem)
    parser = etree.XMLParser(recover=True)
    elem = etree.fromstring(elem, parser=parser)
    elem = etree.tostring(elem)
    elem = xmltodict.parse(elem)
    print(elem)