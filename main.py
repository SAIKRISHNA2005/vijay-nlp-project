import sys
import os

# Add current folder to Python path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    print("=" * 55)
    print("  B2B RFP AUTOMATION — Asian Paints Challenge IV")
    print("=" * 55)
    
    # Default to sample RFP, but allow custom path as argument
    # Usage: python main.py                     → uses sample RFP
    # Usage: python main.py my_rfp.pdf          → uses your PDF
    rfp_path = sys.argv[1] if len(sys.argv) > 1 else "data/rfp_samples/sample_rfp.txt"
    
    print(f"\n📂 Processing: {rfp_path}\n")
    
    if not os.path.exists(rfp_path):
        print(f"❌ File not found: {rfp_path}")
        sys.exit(1)
    
    from crew.rfp_crew import run_rfp_pipeline
    result = run_rfp_pipeline(rfp_path)
    
    print("\n" + "=" * 55)
    print("✅ COMPLETE!")
    print(f"   Recommended SKU: {result['recommended_sku']}")
    print(f"   Grand Total: ₹ {result['pricing']['grand_total']:,}")
    print(f"   Proposal saved to: output/proposal_draft.txt")
    print("=" * 55)

if __name__ == "__main__":
    main()


