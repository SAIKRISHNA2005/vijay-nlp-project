import os
import json
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Get the absolute path of the project root folder
# This fixes the file path issue — no matter where you run from,
# paths will always be calculated from the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

load_dotenv(os.path.join(PROJECT_ROOT, ".env"))


def create_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",          # ← fixed model name
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.1,
        convert_system_message_to_human=True
    )


def run_rfp_pipeline(rfp_file_path: str) -> dict:

    # Fix the file path — convert to absolute path based on project root
    if not os.path.isabs(rfp_file_path):
        rfp_file_path = os.path.join(PROJECT_ROOT, rfp_file_path)

    # Fix all data file paths the same way
    catalog_path     = os.path.join(PROJECT_ROOT, "data", "products", "product_catalog.json")
    unit_prices_path = os.path.join(PROJECT_ROOT, "data", "pricing", "unit_prices.json")
    test_prices_path = os.path.join(PROJECT_ROOT, "data", "pricing", "test_prices.json")

    # Debug: confirm paths exist
    print(f"   Project root: {PROJECT_ROOT}")
    print(f"   RFP path: {rfp_file_path}")
    print(f"   RFP exists: {os.path.exists(rfp_file_path)}")
    print(f"   Catalog exists: {os.path.exists(catalog_path)}")

    from tools.pdf_reader import read_document
    from tools.spec_extractor import extract_specs_from_text, specs_to_sentence
    from tools.sku_matcher import find_top_skus, build_comparison_table
    from tools.pricing_calculator import calculate_pricing, format_pricing_summary

    # ── Step 1: Read the RFP ──────────────────────────────────────────────
    print("\n📄 Reading RFP...")
    rfp_text = read_document(rfp_file_path)
    print(f"   Preview: {rfp_text[:120]}")

    if rfp_text.startswith("ERROR"):
        print(f"❌ {rfp_text}")
        return {"error": rfp_text}

    # ── Step 2: Extract specs ─────────────────────────────────────────────
    print("\n🔍 Extracting specs...")
    specs = extract_specs_from_text(rfp_text)
    print(f"   Specs: {specs}")
    rfp_sentence = specs_to_sentence(specs)
    print(f"   Sentence: {rfp_sentence}")

    # ── Step 3: Match SKUs ────────────────────────────────────────────────
    print("\n🎯 Matching SKUs...")
    top_skus = find_top_skus(
        rfp_sentence=rfp_sentence,
        rfp_specs=specs,
        catalog_path=catalog_path
    )
    comparison = build_comparison_table(specs, top_skus)
    print(comparison)

    # ── Step 4: Calculate pricing ─────────────────────────────────────────
    print("\n💰 Calculating pricing...")
    recommended = top_skus[0]["sku"]
    pricing = calculate_pricing(
        sku=recommended,
        quantity_meters=specs.get("quantity_meters") or 100,
        tests_required=specs.get("tests_required") or [],
        unit_prices_path=unit_prices_path,
        test_prices_path=test_prices_path
    )
    pricing_text = format_pricing_summary(pricing)
    print(pricing_text)

    # ── Step 5: Build task content as variables ───────────────────────────
    rfp_preview = rfp_text[:1500]
    specs_json  = json.dumps(specs, indent=2)

    print(f"\n✅ rfp_preview length: {len(rfp_preview)} chars")

    # ── Step 6: Create LLM and Agents ────────────────────────────────────
    print("\n🤖 Starting AI agents...")
    llm = create_llm()

    sales_agent = Agent(
        role="Sales Intelligence Agent",
        goal="Extract key metadata from RFP documents: project title, deadline, authority, and commercial terms",
        backstory="""You are a B2B sales expert who reads government RFPs daily.
        You are precise, extract only facts stated in the document, and never guess.""",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    technical_agent = Agent(
        role="Technical Specification Agent",
        goal="Validate that the recommended SKU technically complies with all RFP requirements",
        backstory="""You are a cable engineer with deep knowledge of IS standards,
        XLPE insulation, armoured cables, and power distribution. You write clear
        technical compliance statements.""",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    proposal_agent = Agent(
        role="Senior Proposal Writer",
        goal="Write a complete, professional, winning RFP response proposal",
        backstory="""You have written 200+ successful B2B proposals for cable companies.
        You write in formal English, structure proposals clearly, and focus on
        demonstrating technical capability and value.""",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    # ── Step 7: Define Tasks ──────────────────────────────────────────────

    task1_description = f"""
You are analyzing an RFP document. Here is the full RFP content:

--- RFP CONTENT START ---
{rfp_preview}
--- RFP CONTENT END ---

From the above RFP text, extract and list these items:
- Project title
- Issuing authority
- Submission deadline
- Delivery location
- Payment terms

If any item is not mentioned in the RFP, write "Not specified".
"""

    task2_description = f"""
Write a technical compliance statement for this RFP response.

The RFP requires these specifications:
{specs_json}

Our recommended product is: {recommended}

Comparison of top 3 matching SKUs:
{comparison}

Write 150-200 words explaining:
1. Why {recommended} is the best match
2. Which specs match exactly
3. Any minor variances
"""

    task3_description = f"""
Write a complete professional RFP response proposal with exactly these 7 sections:

1. Executive Summary
2. Scope of Supply
3. Technical Compliance
4. Recommended Product ({recommended})
5. Pricing
6. Delivery Terms
7. Our Commitment

Use this pricing data for Section 5:
{pricing_text}

Keep it professional, concise, and under 500 words total.
"""

    task1 = Task(
        description=task1_description,
        agent=sales_agent,
        expected_output="A bullet-point list of: project title, issuing authority, deadline, delivery location, payment terms."
    )

    task2 = Task(
        description=task2_description,
        agent=technical_agent,
        expected_output="A technical compliance statement of 150-200 words."
    )

    task3 = Task(
        description=task3_description,
        agent=proposal_agent,
        expected_output="A complete proposal with all 7 sections."
    )

    # ── Step 8: Run the Crew ──────────────────────────────────────────────
    crew = Crew(
        agents=[sales_agent, technical_agent, proposal_agent],
        tasks=[task1, task2, task3],
        process=Process.sequential,
        verbose=True
    )

    result = crew.kickoff()

    # ── Step 9: Save outputs ──────────────────────────────────────────────
    output_dir = os.path.join(PROJECT_ROOT, "output")
    os.makedirs(output_dir, exist_ok=True)

    with open(os.path.join(output_dir, "proposal_draft.txt"), "w", encoding="utf-8") as f:
        f.write(str(result))
        f.write("\n\n")
        f.write(pricing_text)

    with open(os.path.join(output_dir, "proposal_data.json"), "w", encoding="utf-8") as f:
        json.dump({
            "specs": specs,
            "top_skus": [{"sku": s["sku"], "score": s["combined_score"]} for s in top_skus],
            "recommended": recommended,
            "pricing": pricing
        }, f, indent=2)

    print("\n✅ Done! Check output/proposal_draft.txt")
    return {"recommended_sku": recommended, "pricing": pricing, "proposal": str(result)}