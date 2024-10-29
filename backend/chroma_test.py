from storage.chroma_store import VectorCollection

test_collection = VectorCollection("test_metadata")
test_collection.add([
    {
        "data": "This is some example text",
        "metadata": {"url": "www.something.ro"},
        "id": "4efg"
    }
])

print(test_collection.exist_by_metadata({
    "url": "www.something.ro"
}))