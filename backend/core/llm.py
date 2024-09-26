from decouple import config
from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3.1:latest", base_url=config('OLLAMA_HOST', default='no_key'))
