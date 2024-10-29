from core.documentor import Documentor
from tasks.queue import task_manager

@task_manager.task(ignore_result=False)
def get_formats(files):
    return Documentor.get_files_format(files)

@task_manager.task(ignore_result=False)
def get_documentation(file):
    return Documentor.get_file_content(file)