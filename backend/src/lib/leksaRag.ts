/**
 * Leksa RAG integration — shared across project chat and tabular review.
 *
 * Fetches relevant Tanzanian legal context (statutes, case law, precedents)
 * from the Leksa Django service and returns a formatted string ready to inject
 * into any LLM system/user prompt.
 *
 * Set LEKSA_RAG_URL in backend/.env to enable. Degrades gracefully if unset
 * or if the service is unreachable — callers always receive a string (empty on
 * failure), never an exception.
 */

interface LeksaChunk {
    text: string;
    source: string;
    citation: string;
    score: number;
    doc_id: string;
}

interface LeksaRetrieveResponse {
    chunks: LeksaChunk[];
    sources: { title: string; url: string }[];
    intent: string;
    language: string;
}

/**
 * Query the Leksa RAG service for Tanzanian legal context relevant to `query`.
 *
 * @param query   Natural-language query (column prompt, user message, etc.)
 * @param topK    Number of chunks to retrieve (default: LEKSA_RAG_TOP_K env or 8)
 * @returns       Formatted markdown block, or "" if nothing was retrieved.
 */
export async function fetchLegalContext(
    query: string,
    topK?: number,
): Promise<string> {
    const ragUrl = process.env.LEKSA_RAG_URL;
    if (!ragUrl || !query.trim()) return "";

    try {
        const k = topK ?? parseInt(process.env.LEKSA_RAG_TOP_K ?? "8", 10);
        const res = await fetch(`${ragUrl}/rag/retrieve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, top_k: k }),
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) return "";

        const data: LeksaRetrieveResponse = await res.json();
        if (!data.chunks?.length) return "";

        const contextBlock = data.chunks
            .map((c) =>
                `[${c.source}${c.citation ? ` — ${c.citation}` : ""}]\n${c.text}`,
            )
            .join("\n\n");

        return (
            `\n\n## Tanzanian Legal Context\n` +
            `_Retrieved from Leksa legal corpus (${data.intent} / ${data.language})_\n\n` +
            contextBlock
        );
    } catch {
        // RAG service unavailable — degrade gracefully
        return "";
    }
}
