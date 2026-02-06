try:
    import langchain
    print(f"LangChain found: {langchain.__file__}")
    from langchain.memory import ConversationBufferMemory
    print("ConversationBufferMemory imported successfully")
except ImportError as e:
    print(f"ImportError: {e}")
    import sys
    print(sys.path)
