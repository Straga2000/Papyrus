# python can also run in-memory with no server running:

import chromadb
from uuid import uuid4
from chromadb.utils import embedding_functions
from prompt_toolkit import pep440
from scipy.stats import kappa4

# chroma run --host localhost --port 8000 --path ./chroma_data
print("Client start")
vector_database = chromadb.HttpClient()
default_ef = embedding_functions.DefaultEmbeddingFunction()
print("Client inited")


class VectorCollection:

    def __init__(self, name):
        self.name = name
        self.collection = vector_database.get_or_create_collection(name, embedding_function=default_ef)

    def add(self, documents):
        kwargs = {}

        metadata = [doc.get("metadata") for doc in documents if isinstance(doc, dict)]
        if metadata:
            kwargs["metadatas"] = metadata

        # thi should always be created
        kwargs["ids"] = [doc.get("id", str(uuid4())) for doc in documents if isinstance(doc, dict)]


        documents = [doc.get("data") if isinstance(doc, dict) else doc for doc in documents]
        if not documents:
            raise Exception("There are no documents to add")

        kwargs["documents"] = documents

        print(kwargs)
        # kwargs["ids"] = [str(uuid4()) for _ in documents]

        self.collection.add(**kwargs)
        return kwargs

    def query(self, *texts, n_results=1, include=None, **kwargs):
        # add kwargs for using special queries supported by chroma
        if include is None:
            include = ["documents", "metadatas", "distances"]

        return self.collection.query(query_texts=texts, n_results=n_results, include=include, **kwargs)

    def exist_by_metadata(self, metadata):
        return self.collection.get(where=metadata)
        # self.collection.query([], n_results=1, where=metadata)

    def update(self, documents):
        kwargs = {}

        ids = [doc.get("id") for doc in documents if isinstance(doc, dict)]

        if len(ids) == 0:
            raise Exception("Cannot update without the ids of the objects")
        kwargs["ids"] = ids

        metadata = [doc.get("metadata") for doc in documents if isinstance(doc, dict)]
        if len(metadata) == 0:
            kwargs["metadatas"] = metadata

        documents = [doc.get("data") if isinstance(doc, dict) else doc for doc in documents]
        if len(ids) != len(documents):
            raise Exception("The number of documents should be equal to the number of documents")

        kwargs["documents"] = documents

        self.collection.update(**kwargs)
        return kwargs

    # we should use the special functions for easier find of