from rag.embedder import build_vectorstore


def get_relevant_chunks(jd_text: str, query: str) -> str:
    vectorstore, parent_chunks = build_vectorstore(jd_text)

    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": 6,
            "fetch_k": 20
        }
    )

    results = retriever.get_relevant_documents(query)

    seen_parent_ids = set()
    unique_parents = []

    for doc in results:
        parent_id = doc.metadata["parent_id"]
        if parent_id not in seen_parent_ids:
            seen_parent_ids.add(parent_id)
            unique_parents.append(doc.metadata["parent_content"])

    return "\n\n".join(unique_parents)