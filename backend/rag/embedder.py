from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

parent_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2400,
    chunk_overlap=0,
    length_function=len
)

child_splitter = RecursiveCharacterTextSplitter(
    chunk_size=600,
    chunk_overlap=200,
    length_function=len
)


def build_vectorstore(jd_text: str):
    parent_chunks = parent_splitter.split_text(jd_text)

    child_docs = []
    for parent_id, parent_chunk in enumerate(parent_chunks):
        children = child_splitter.split_text(parent_chunk)
        for child in children:
            child_docs.append(Document(
                page_content=child,
                metadata={
                    "parent_id": parent_id,
                    "parent_content": parent_chunk
                }
            ))

    vectorstore = FAISS.from_documents(child_docs, embeddings)
    return vectorstore, parent_chunks