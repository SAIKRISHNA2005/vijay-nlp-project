import json
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load the AI model once when this file is first imported.
# _model = None means "not loaded yet"
_model = None

def get_model():
    """
    Load the sentence transformer model.
    We only load it once because it takes a few seconds.
    After that it stays in memory.
    """
    global _model
    if _model is None:
        print("Loading AI model... (30 seconds first time, instant after)")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def product_to_sentence(product: Dict) -> str:
    """
    Same as specs_to_sentence but for a product dict.
    We need both RFP and products in the same sentence format
    so the comparison is fair (apples to apples).
    """
    parts = []
    if product.get("voltage"):           parts.append(product["voltage"])
    if product.get("cores"):             parts.append(f"{product['cores']} core")
    if product.get("conductor"):         parts.append(product["conductor"])
    if product.get("insulation"):        parts.append(product["insulation"])
    if product.get("armour") == "Yes":   parts.append("armoured")
    if product.get("cross_section"):     parts.append(product["cross_section"])
    if product.get("standard"):          parts.append(product["standard"])
    parts.append("cable")
    return " ".join(parts)


def calculate_spec_match(rfp_specs: Dict, product: Dict) -> float:
    """
    Field-by-field exact match checker.
    
    This is DIFFERENT from cosine similarity.
    Cosine similarity = "how similar do these sentences sound?"
    This function = "do the exact values match field by field?"
    
    We combine both scores for the final ranking.
    """
    fields = ["voltage", "conductor", "insulation", "armour", "standard"]
    matched = 0
    total = 0
    
    for field in fields:
        rfp_val = rfp_specs.get(field)
        prod_val = product.get(field)
        
        if rfp_val is not None:   # Only check fields we actually found in the RFP
            total += 1
            if rfp_val and prod_val:
                if rfp_val.lower().strip() == prod_val.lower().strip():
                    matched += 1
    
    if total == 0:
        return 0.0
    return round((matched / total) * 100, 1)


def find_top_skus(rfp_sentence: str, rfp_specs: Dict, catalog_path: str, top_n: int = 3) -> List[Dict]:
    """
    Main matching function. Returns top N products ranked by match quality.
    
    Process:
    1. Load all products from catalog
    2. Convert everything (RFP + products) to sentence vectors
    3. Calculate cosine similarity between RFP vector and each product vector
    4. Also calculate exact field match %
    5. Combine scores, sort, return top 3
    """
    
    # Load the product catalog from JSON file
    with open(catalog_path, "r") as f:
        catalog = json.load(f)
    
    # Convert every product to a sentence
    product_sentences = [product_to_sentence(p) for p in catalog]
    
    # Get the AI model
    model = get_model()
    
    # Convert sentences to vectors (lists of numbers)
    # encode() is the function that does this conversion
    rfp_vector = model.encode([rfp_sentence])         # Shape: (1, 384)
    product_vectors = model.encode(product_sentences) # Shape: (N, 384)
    # 384 = the number of dimensions in this model's vector space
    
    # Calculate cosine similarity between RFP and ALL products at once
    # Result shape: (1, N) — one similarity score per product
    similarities = cosine_similarity(rfp_vector, product_vectors)[0]
    # [0] gets the first (and only) row, giving us a flat list of scores
    
    # Build results list
    results = []
    for i, product in enumerate(catalog):
        semantic = float(similarities[i])
        exact = calculate_spec_match(rfp_specs, product)
        
        # Weighted combination: semantic similarity is good for fuzzy matching,
        # exact match is good for catching critical field differences
        combined = (semantic * 0.6) + (exact / 100 * 0.4)
        
        results.append({
            "sku": product["sku"],
            "name": product["name"],
            "product": product,
            "semantic_similarity": round(semantic * 100, 1),
            "spec_match_percent": exact,
            "combined_score": round(combined * 100, 1)
        })
    
    # Sort highest score first, return top N
    results.sort(key=lambda x: x["combined_score"], reverse=True)
    return results[:top_n]


def build_comparison_table(rfp_specs: Dict, top_skus: List[Dict]) -> str:
    """
    Build a visual table comparing RFP requirements vs each SKU.
    ✓ = matches, ✗ = doesn't match
    """
    fields = ["voltage", "conductor", "insulation", "armour", "standard"]
    lines = []
    
    # Header row
    header = f"{'Spec':<14} | {'RFP Needs':<18}"
    for s in top_skus:
        header += f" | {s['sku'][:16]:<16}"
    lines.append(header)
    lines.append("─" * len(header))
    
    # One row per spec field
    for field in fields:
        rfp_val = str(rfp_specs.get(field) or "N/A")
        row = f"{field.capitalize():<14} | {rfp_val:<18}"
        for s in top_skus:
            prod_val = str(s["product"].get(field) or "N/A")
            match = "✓" if rfp_val.lower() == prod_val.lower() else "✗"
            row += f" | {match} {prod_val:<14}"
        lines.append(row)
    
    # Score row at the bottom
    lines.append("─" * len(header))
    score_row = f"{'Match Score':<14} | {'':<18}"
    for s in top_skus:
        score_row += f" | {s['combined_score']}%{'':<13}"
    lines.append(score_row)
    
    return "\n".join(lines)