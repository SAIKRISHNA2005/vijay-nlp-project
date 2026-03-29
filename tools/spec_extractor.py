import re
from typing import Dict, Any

def extract_specs_from_text(rfp_text: str) -> Dict[str, Any]:
    """
    Find technical specs hiding inside messy RFP text.
    
    How regex works:
      re.search(pattern, text) scans the text for the pattern.
      If found, .group(1) gives you what was inside the first ( ) in the pattern.
    
    Example:
      Pattern: r'(\d+)\s*core'
      Text:    "4 Core aluminium cable"
      Match:   group(1) = "4"
    """
    
    # Start with all None — we'll fill these in as we find them
    specs = {
        "voltage": None,
        "cores": None,
        "conductor": None,
        "cross_section": None,
        "insulation": None,
        "armour": None,
        "standard": None,
        "quantity_meters": None,
        "tests_required": [],
        "project_title": None
    }
    
    # Always search lowercase so "XLPE" and "xlpe" both match
    text_lower = rfp_text.lower()
    
    # ── VOLTAGE ─────────────────────────────────────────────────────────
    # Looks for patterns like: "1.1kV", "3.3 kV", "1100V"
    voltage_match = re.search(r'(\d+\.?\d*\s*kv)', text_lower)
    if voltage_match:
        # .upper() converts "1.1kv" → "1.1KV" for clean output
        specs["voltage"] = voltage_match.group(1).strip().upper()
    
    # ── NUMBER OF CORES ──────────────────────────────────────────────────
    # Looks for: "4 core", "3core", "4-core"
    cores_match = re.search(r'(\d+)\s*core', text_lower)
    if cores_match:
        specs["cores"] = int(cores_match.group(1))   # int() converts "4" string to number 4
    
    # ── CONDUCTOR MATERIAL ───────────────────────────────────────────────
    # No regex needed — just check if the word exists in the text
    if "aluminium" in text_lower or "aluminum" in text_lower:
        specs["conductor"] = "Aluminium"
    elif "copper" in text_lower:
        specs["conductor"] = "Copper"
    
    # ── CROSS SECTION ────────────────────────────────────────────────────
    # Looks for: "35 sq.mm", "50sqmm", "35 sq mm"
    sqmm_match = re.search(r'(\d+)\s*sq\.?\s*mm', text_lower)
    if sqmm_match:
        specs["cross_section"] = f"{sqmm_match.group(1)} sq.mm"
    
    # ── INSULATION ───────────────────────────────────────────────────────
    if "xlpe" in text_lower:
        specs["insulation"] = "XLPE"
    elif "pvc" in text_lower and "insulation" in text_lower:
        specs["insulation"] = "PVC"
    
    # ── ARMOURING ────────────────────────────────────────────────────────
    if any(w in text_lower for w in ["armoured", "armouring", "steel wire armoured"]):
        specs["armour"] = "Yes"
    elif "unarmoured" in text_lower:
        specs["armour"] = "No"
    
    # ── STANDARD ─────────────────────────────────────────────────────────
    # Looks for: "IS 7098", "IS 1554", "IS 7098 Part 1"
    std_match = re.search(r'(is\s*\d+(?:\s*part\s*\d+)?)', text_lower)
    if std_match:
        specs["standard"] = std_match.group(1).upper()
    
    # ── QUANTITY ─────────────────────────────────────────────────────────
    qty_match = re.search(r'(\d+)\s*meter', text_lower)
    if qty_match:
        specs["quantity_meters"] = int(qty_match.group(1))
    
    # ── REQUIRED TESTS ───────────────────────────────────────────────────
    # Check if each known test name appears in the RFP text
    known_tests = [
        "High Voltage Test",
        "Insulation Resistance Test",
        "Conductor Resistance Test",
        "Tensile Strength Test",
        "Bend Test"
    ]
    for test in known_tests:
        if test.lower() in text_lower:
            specs["tests_required"].append(test)
    
    # ── PROJECT TITLE ─────────────────────────────────────────────────────
    title_match = re.search(r'project title[:\s]+(.+)', rfp_text, re.IGNORECASE)
    if title_match:
        specs["project_title"] = title_match.group(1).strip()
    
    return specs


def specs_to_sentence(specs: Dict[str, Any]) -> str:
    """
    Convert specs dict into a single natural language sentence.
    
    WHY? The SKU matcher uses sentence similarity.
    It can't compare dictionaries — it needs sentences.
    
    Output example:
      "1.1KV 4 core Aluminium XLPE armoured 35 sq.mm IS 7098 cable"
    """
    parts = []
    if specs.get("voltage"):          parts.append(specs["voltage"])
    if specs.get("cores"):            parts.append(f"{specs['cores']} core")
    if specs.get("conductor"):        parts.append(specs["conductor"])
    if specs.get("insulation"):       parts.append(specs["insulation"])
    if specs.get("armour") == "Yes":  parts.append("armoured")
    if specs.get("cross_section"):    parts.append(specs["cross_section"])
    if specs.get("standard"):         parts.append(specs["standard"])
    parts.append("cable")
    return " ".join(parts)