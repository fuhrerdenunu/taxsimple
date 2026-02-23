from typing import Dict, Any, List
from engine.recovery import TaxCalculationRecoveryService

class TaxCalculationNode:
    def __init__(self, node_id, calculation_func, dependencies=None):
        self.node_id = node_id
        self.calc_func = calculation_func
        self.dependencies = dependencies or []
        self.value = None

class TaxCalculationEngine:
    def __init__(self):
        self.recovery_service = TaxCalculationRecoveryService()

    def build_dag(self, tax_year: int, profile: Dict, slips: List[Dict]):
        nodes = {}
        
        # 1. Total Income Node
        def calc_total_income(deps):
            total = 0
            for slip in deps.get("slips", []):
                if slip.get("type") == "T4":
                    total += slip.get("boxes", {}).get("14", 0)
                elif slip.get("type") == "T4A":
                    total += slip.get("boxes", {}).get("28", 0) # Other income
                elif slip.get("type") == "T5":
                    total += slip.get("boxes", {}).get("24", 0) # Dividends
                elif slip.get("type") == "T2125":
                    total += slip.get("netIncome", 0)
            return total
            
        nodes["total_income"] = TaxCalculationNode("total_income", calc_total_income)

        # 2. Net Income Node (Simplified: Total Income - basic deductions)
        def calc_net_income(deps):
            total_income = deps.get("total_income", 0)
            # Deduct RRSP
            rrsp_deduction = 0
            for slip in deps.get("slips", []):
                if slip.get("type") == "RRSP":
                    rrsp_deduction += slip.get("amount", 0)
            return max(0, total_income - rrsp_deduction)

        nodes["net_income"] = TaxCalculationNode("net_income", calc_net_income, ["total_income"])

        # 3. Taxable Income
        def calc_taxable_income(deps):
            return deps.get("net_income", 0)
            
        nodes["taxable_income"] = TaxCalculationNode("taxable_income", calc_taxable_income, ["net_income"])

        # 4. Federal Tax
        def calc_federal_tax(deps):
            taxable = deps.get("taxable_income", 0)
            # Basic 2025 brackets approximation
            if taxable <= 55867:
                return taxable * 0.15
            elif taxable <= 111733:
                return (55867 * 0.15) + ((taxable - 55867) * 0.205)
            else:
                return (55867 * 0.15) + ((111733 - 55867) * 0.205) + ((taxable - 111733) * 0.26)
        
        nodes["federal_tax"] = TaxCalculationNode("federal_tax", calc_federal_tax, ["taxable_income"])

        # 5. Total Tax Deducted at Source
        def calc_tax_deducted(deps):
            deducted = 0
            for slip in deps.get("slips", []):
                if slip.get("type") == "T4":
                    deducted += slip.get("boxes", {}).get("22", 0)
                elif slip.get("type") == "T4A":
                    deducted += slip.get("boxes", {}).get("22", 0)
            return deducted
            
        nodes["tax_deducted"] = TaxCalculationNode("tax_deducted", calc_tax_deducted)

        # 6. Refund or Balance (+ refund, - balance owing)
        def calc_refund_or_balance(deps):
            return deps.get("tax_deducted", 0) - deps.get("federal_tax", 0)
            
        nodes["refund_or_balance"] = TaxCalculationNode("refund_or_balance", calc_refund_or_balance, ["federal_tax", "tax_deducted"])
        
        return nodes

    def calculate(self, tax_year: int, profile: Dict, slips: List[Dict]) -> Dict:
        """
        Calculates the tax return by evaluating the DAG in topological order.
        """
        nodes = self.build_dag(tax_year, profile, slips)
        
        # Simple evaluation loop (for a true DAG you would do topological sort)
        # We know the order for this simple setup.
        computed_values = {"slips": slips, "profile": profile}
        
        evaluation_order = [
            "total_income",
            "tax_deducted",
            "net_income",
            "taxable_income",
            "federal_tax",
            "refund_or_balance"
        ]
        
        for node_id in evaluation_order:
            node = nodes[node_id]
            # Gather dependencies
            deps = {dep: computed_values.get(dep) for dep in node.dependencies}
            deps["slips"] = slips
            deps["profile"] = profile
            # Compute
            val = node.calc_func(deps)
            computed_values[node_id] = val

        # Run sanity checks
        class MockTaxReturn:
            def __init__(self, data):
                self.tax_year = tax_year
                self.total_income = data.get("total_income", 0)
                self.net_income = data.get("net_income", 0)
                
                # Mock pieces mapping
                self.employment_income = sum(s.get("boxes", {}).get("14", 0) for s in slips if s.get("type") == "T4")
                self.self_employment_income = sum(s.get("netIncome", 0) for s in slips if s.get("type") == "T2125")
                self.investment_income = sum(s.get("boxes", {}).get("24", 0) for s in slips if s.get("type") == "T5")
                self.other_income = sum(s.get("boxes", {}).get("28", 0) for s in slips if s.get("type") == "T4A")
                
                self.cpp_contributions = sum(s.get("boxes", {}).get("16", 0) for s in slips if s.get("type") in ["T4", "T4A"])
                self.ei_contributions = sum(s.get("boxes", {}).get("18", 0) for s in slips if s.get("type") in ["T4", "T4A"])
                
                # Default mocks for the rest of the checks
                self.age = 30
                self.claiming_age_amount = False
                self.age_amount = 0
                self.income = data.get("net_income", 0)
                self.medical_expenses = sum(s.get("amount", 0) for s in slips if s.get("type") == "Medical")
            
        mock_return = MockTaxReturn(computed_values)
        sanity_checks = self.recovery_service.validate_calculation_consistency(mock_return)
        computed_values["sanity_checks"] = sanity_checks

        return computed_values
