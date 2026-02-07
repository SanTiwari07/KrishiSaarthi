
import sys
import os

print(f"Python Executable: {sys.executable}")
print(f"User Base: {os.path.expanduser('~')}")
print("Sys Path:")
for p in sys.path:
    print(f"  {p}")

try:
    import langchain
    print(f"LangChain Version: {langchain.__version__}")
    print(f"LangChain File: {langchain.__file__}")
except ImportError as e:
    print(f"LangChain Import Error: {e}")

try:
    import langchain_community
    print(f"LangChain Community Version: {langchain_community.__version__}")
    print(f"LangChain Community File: {langchain_community.__file__}")
except ImportError as e:
    print(f"LangChain Community Import Error: {e}")

try:
    from langchain.chains import ConversationChain
    print("Successfully imported ConversationChain")
except ImportError as e:
    print(f"Failed to import ConversationChain: {e}")
    try:
        import langchain.chains
        print(f"langchain.chains dir: {dir(langchain.chains)}")
    except ImportError:
        print("Could not import langchain.chains either")
