from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

from engine.dag import TaxCalculationEngine
from engine.optimizer import OptimizationEngine
from api.netfile import NetfileService

app = FastAPI(title="TaxSimple Engine API", version="1.0.0")

# Configure CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = TaxCalculationEngine()
optimizer = OptimizationEngine()
netfile_service = NetfileService()

class CalculationRequest(BaseModel):
    tax_year: int
    profile: Dict[str, Any]
    slips: List[Dict[str, Any]]

@app.get("/")
def read_root():
    return {"status": "ok", "service": "TaxSimple Engine API"}

@app.post("/api/calculate")
def calculate_return(request: CalculationRequest):
    result = engine.calculate(request.tax_year, request.profile, request.slips)
    return result

@app.post("/api/optimize")
def optimize_return(request: CalculationRequest):
    # Calculate base scenario first
    base_result = engine.calculate(request.tax_year, request.profile, request.slips)
    # Get optimization opportunities
    opportunities = optimizer.analyze(base_result, request.tax_year, request.profile, request.slips)
    return {
        "base_refund": base_result.get("refund_or_balance", 0),
        "opportunities": opportunities
    }

@app.post("/api/submit")
def submit_netfile(request: CalculationRequest):
    # In a real scenario, this would generate XML and submit to CRA
    result = engine.calculate(request.tax_year, request.profile, request.slips)
    submission_response = netfile_service.submit(result, request.profile)
    return submission_response
