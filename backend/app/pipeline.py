from __future__ import annotations

import json
import site
import sys
import traceback
from pathlib import Path
from typing import Any, Callable


StageLogger = Callable[[str, str, str, int], None]


def _root_dir() -> Path:
    return Path(__file__).resolve().parents[2]


def run_pipeline(file_path: str, stage_logger: StageLogger) -> dict[str, Any]:
    # CrewAI transitively imports pywin32 modules on Windows.
    # Ensure the pywin32 system directory is importable in this process.
    if sys.platform.startswith("win"):
        try:
            import pywintypes  # noqa: F401
        except ModuleNotFoundError:
            for p in site.getsitepackages():
                candidate = Path(p) / "pywin32_system32"
                if candidate.exists():
                    sys.path.append(str(candidate))
                    break

    from tools.pdf_reader import read_document
    from tools.pricing_calculator import calculate_pricing
    from tools.sku_matcher import find_top_skus
    from tools.spec_extractor import extract_specs_from_text, specs_to_sentence

    root = _root_dir()
    catalog_path = str(root / "data" / "products" / "product_catalog.json")
    unit_prices_path = str(root / "data" / "pricing" / "unit_prices.json")
    test_prices_path = str(root / "data" / "pricing" / "test_prices.json")

    stage_logger("document_reading", "in_progress", "Reading document text", 5)
    rfp_text = read_document(file_path)
    if rfp_text.startswith("ERROR"):
        raise RuntimeError(rfp_text)
    stage_logger("document_reading", "completed", "Document parsed", 20)

    stage_logger("spec_extraction", "in_progress", "Extracting technical specs", 30)
    specs = extract_specs_from_text(rfp_text)
    sentence = specs_to_sentence(specs)
    stage_logger("spec_extraction", "completed", "Specs extracted", 45)

    stage_logger("sku_matching", "in_progress", "Matching SKUs against catalog", 55)
    top_skus = find_top_skus(sentence, specs, catalog_path)
    recommended = top_skus[0]["sku"] if top_skus else ""
    stage_logger("sku_matching", "completed", f"Recommended SKU: {recommended}", 70)

    stage_logger("pricing_calculation", "in_progress", "Calculating pricing", 75)
    pricing = calculate_pricing(
        sku=recommended,
        quantity_meters=specs.get("quantity_meters") or 100,
        tests_required=specs.get("tests_required") or [],
        unit_prices_path=unit_prices_path,
        test_prices_path=test_prices_path,
    )
    stage_logger("pricing_calculation", "completed", "Pricing computed", 85)

    stage_logger("proposal_generation", "in_progress", "Generating proposal content", 90)
    proposal_text = build_proposal_template(specs, recommended, pricing)
    stage_logger("proposal_generation", "completed", "Proposal generated", 100)

    return {
        "specs": specs,
        "sku_recommendation": top_skus[0] if top_skus else None,
        "sku_alternatives": top_skus[1:],
        "pricing": pricing,
        "proposal": {
            "content": proposal_text,
            "metadata": {
                "recommended_sku": recommended,
            },
        },
    }


def build_proposal_template(specs: dict[str, Any], recommended: str, pricing: dict[str, Any]) -> str:
    return (
        "1. Executive Summary\n"
        "We are pleased to submit our response for the requested cable supply requirement.\n\n"
        "2. Scope of Supply\n"
        f"Recommended SKU: {recommended}\n"
        f"Quantity: {specs.get('quantity_meters') or 100} meters\n\n"
        "3. Technical Compliance\n"
        f"Voltage: {specs.get('voltage')}\n"
        f"Cores: {specs.get('cores')}\n"
        f"Conductor: {specs.get('conductor')}\n"
        f"Insulation: {specs.get('insulation')}\n"
        f"Cross-section: {specs.get('cross_section')}\n"
        f"Standard: {specs.get('standard')}\n\n"
        "4. Recommended Product\n"
        f"{recommended} is selected as the best available catalog match based on semantic and exact-spec scoring.\n\n"
        "5. Pricing\n"
        f"Base cost: Rs {pricing.get('material_cost', 0):,}\n"
        f"GST: Rs {pricing.get('gst_18_percent', 0):,}\n"
        f"Testing: Rs {pricing.get('total_test_cost', 0):,}\n"
        f"Grand total: Rs {pricing.get('grand_total', 0):,}\n\n"
        "6. Delivery Terms\n"
        "Delivery timeline and logistics will be aligned to project scheduling and dispatch approvals.\n\n"
        "7. Our Commitment\n"
        "We commit to compliant supply, transparent commercial terms, and timely support throughout execution.\n"
    )


def format_pipeline_error(exc: Exception) -> dict[str, Any]:
    return {
        "message": str(exc),
        "traceback": traceback.format_exc(limit=6),
    }

