from decouple import config
from langchain_ollama import ChatOllama, OllamaLLM

llm = ChatOllama(model="llama3.2-vision:latest", base_url=config('OLLAMA_HOST', default='no_key'))
llm_image = ChatOllama(model="llama3.2-vision:latest", base_url=config('OLLAMA_HOST', default='no_key'))
llm_image.num_ctx = 1024
