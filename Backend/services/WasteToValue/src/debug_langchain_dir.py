import langchain
print(dir(langchain))
try:
    import langchain.memory
    print("langchain.memory exists")
except ImportError:
    print("langchain.memory does NOT exist")
