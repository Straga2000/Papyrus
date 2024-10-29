from decouple import config
from langchain_ollama import ChatOllama, OllamaLLM

llm = ChatOllama(model="llama3.1:latest", base_url=config('OLLAMA_HOST', default='no_key'))
llm_image = ChatOllama(model="llava", base_url=config('OLLAMA_HOST', default='no_key'))
