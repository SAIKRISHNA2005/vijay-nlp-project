import json
from typing import Dict, List, Any

def calculate_pricing(sku: str, quantity_meters: int, tests_required: List[str],
                      unit_prices_path: str, test_prices_path: str) -> Dict[str, Any]:
    """
    Calculate complete cost breakdown for a cable order.
    """
    
    # Load both price tables
    with open(unit_prices_path) as f:
        unit_prices = json.load(f)
    with open(test_prices_path) as f:
        test_prices = json.load(f)
    
    # Check the SKU exists in our price table
    if sku not in unit_prices:
        return {"error": f"SKU '{sku}' not in price table"}
    
    # Material cost = price per meter × total meters
    price_per_meter = unit_prices[sku]["price_per_meter"]
    material_cost = price_per_meter * quantity_meters
    
    # Test costs — loop through each required test and add it up
    test_breakdown = []
    total_test_cost = 0
    for test_name in tests_required:
        cost = test_prices.get(test_name, {}).get("price", 0)
        total_test_cost += cost
        test_breakdown.append({"test": test_name, "cost": cost})
    
    # Final totals
    subtotal = material_cost + total_test_cost
    gst = round(subtotal * 0.18)      # 18% GST
    grand_total = subtotal + gst
    
    return {
        "sku": sku,
        "quantity_meters": quantity_meters,
        "price_per_meter": price_per_meter,
        "material_cost": material_cost,
        "test_breakdown": test_breakdown,
        "total_test_cost": total_test_cost,
        "subtotal": subtotal,
        "gst_18_percent": gst,
        "grand_total": grand_total
    }


def format_pricing_summary(p: Dict) -> str:
    """Turn the pricing dict into a readable string for the proposal."""
    
    if "error" in p:
        return f"Pricing Error: {p['error']}"
    
    lines = [
        "=" * 45,
        "PRICING SUMMARY",
        "=" * 45,
        f"SKU:            {p['sku']}",
        f"Quantity:       {p['quantity_meters']} meters @ ₹{p['price_per_meter']}/m",
        f"Material Cost:  ₹ {p['material_cost']:,}",
        ""
    ]
    if p["test_breakdown"]:
        lines.append("Testing Costs:")
        for t in p["test_breakdown"]:
            lines.append(f"  {t['test']}: ₹ {t['cost']:,}")
        lines.append(f"Total Tests:    ₹ {p['total_test_cost']:,}")
    
    lines += [
        "",
        f"Subtotal:       ₹ {p['subtotal']:,}",
        f"GST (18%):      ₹ {p['gst_18_percent']:,}",
        "─" * 45,
        f"GRAND TOTAL:    ₹ {p['grand_total']:,}",
        "=" * 45
    ]
    return "\n".join(lines)
