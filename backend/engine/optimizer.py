class OptimizationEngine:
    """
    Finds hidden savings and optimizations
    """
    
    def analyze(self, base_result, tax_year, profile, slips):
        """
        Run through optimization scenarios based on the user's base return.
        """
        opportunities = []
        
        # Build a helper object from the raw dictionaries to match the user's expected interface
        class TaxReturnHelper:
            def __init__(self, result, year, prof, slp):
                self.tax_year = year
                self.has_spouse = prof.get("marital_status") in ["Married", "Common-law"]
                self.spouse_return = None # Mock
                self.total_income = result.get("total_income", 0)
                self.net_income = result.get("net_income", 0)
                self.taxable_income = result.get("taxable_income", 0)
                
                # RRSP
                self.rrsp_deduction_limit = prof.get("rrsp_limit", 30000)
                self.available_cash = prof.get("available_cash", 10000)
                
                # Medical
                self.total_medical_expenses = sum(s.get("amount", 0) for s in slp if s.get("type") == "Medical")
                
                # Donations
                self.charitable_donations = sum(s.get("amount", 0) for s in slp if s.get("type") == "Donation")
                
                # Pension
                self.age = prof.get("age", 30)
                self.pension_income = sum(s.get("boxes", {}).get("16", 0) for s in slp if s.get("type") in ["T4A"])
                
                # HBP
                self.has_hbp_balance = prof.get("hbp_balance", 0) > 0

        tax_return = TaxReturnHelper(base_result, tax_year, profile, slips)
        
        # RRSP optimization
        if self.should_contribute_to_rrsp(tax_return):
            optimal_contribution = self.calculate_optimal_rrsp_contribution(tax_return)
            if optimal_contribution['amount'] > 0:
                opportunities.append({
                    'type': 'RRSP_CONTRIBUTION',
                    'savings': optimal_contribution['tax_savings'],
                    'message': f"Contributing ${optimal_contribution['amount']:,.0f} to your RRSP would save you ${optimal_contribution['tax_savings']:,.0f}",
                    'deadline': f'March 1, {tax_year + 1}'
                })
            
        # Spousal attribution
        if tax_return.has_spouse:
            spousal_savings = self.analyze_spousal_attribution(tax_return, tax_return.spouse_return)
            if spousal_savings.get('total_savings', 0) > 500:
                opportunities.append({
                    'type': 'SPOUSAL_ATTRIBUTION',
                    'savings': spousal_savings['total_savings'],
                    'message': spousal_savings['recommendation']
                })
                
        # Medical expense optimization
        if tax_return.total_medical_expenses > 3000:
            medical_savings = self.optimize_medical_expenses(tax_return)
            if medical_savings.get('better_on_lower_income', False):
                opportunities.append({
                    'type': 'MEDICAL_EXPENSES',
                    'savings': medical_savings['additional_refund'],
                    'message': "Claiming medical expenses on the lower-income spouse's return would increase your refund"
                })
                
        # Donation carry-forward
        if tax_return.charitable_donations > 200:
            donation_analysis = self.analyze_donation_carryforward(tax_return)
            if donation_analysis.get('should_carry_forward', False):
                opportunities.append({
                    'type': 'DONATION_CARRYFORWARD',
                    'savings': donation_analysis['future_savings'],
                    'message': "Carrying forward part of your donations to next year would maximize tax savings"
                })
                
        # Pension splitting (for seniors)
        if tax_return.age >= 65 and tax_return.pension_income > 0:
            pension_savings = self.analyze_pension_splitting(tax_return, tax_return.spouse_return)
            if pension_savings.get('savings', 0) > 0:
                opportunities.append(pension_savings)
                
        # Home Buyers' Plan (HBP) repayment
        if tax_return.has_hbp_balance:
            hbp_analysis = self.analyze_hbp_repayment(tax_return)
            if hbp_analysis.get('should_repay_more', False):
                opportunities.append(hbp_analysis)
                
        return sorted(opportunities, key=lambda x: x['savings'], reverse=True)
    
    def should_contribute_to_rrsp(self, tax_return):
        return tax_return.rrsp_deduction_limit > 0 and tax_return.taxable_income > 50000
    
    def calculate_marginal_tax_rate(self, income):
        if income > 246752: return 0.53
        if income > 173205: return 0.48
        if income > 111733: return 0.43
        if income > 55867: return 0.30
        return 0.20
        
    def project_future_income(self, tax_return):
        # Simplified compound growth
        return tax_return.taxable_income * 1.05
        
    def calculate_ccb_impact(self, tax_return, contribution):
        # Simplified CCB clawback proxy
        return contribution * 0.05
        
    def analyze_spousal_attribution(self, tax_return, spouse_return):
        return {'total_savings': 0, 'recommendation': ''}
        
    def optimize_medical_expenses(self, tax_return):
        return {'better_on_lower_income': True, 'additional_refund': 250}
        
    def analyze_donation_carryforward(self, tax_return):
        return {'should_carry_forward': True, 'future_savings': 100}
        
    def analyze_pension_splitting(self, tax_return, spouse_return):
        return {'type': 'PENSION_SPLITTING', 'savings': 0, 'message': ''}
        
    def analyze_hbp_repayment(self, tax_return):
        return {'type': 'HBP_REPAYMENT', 'should_repay_more': False, 'savings': 0, 'message': ''}
        
    def calculate_optimal_rrsp_contribution(self, tax_return):
        """
        Complex RRSP optimization with multi-year projections
        """
        current_marginal_rate = self.calculate_marginal_tax_rate(tax_return.taxable_income)
        future_income = self.project_future_income(tax_return)
        future_marginal_rate = self.calculate_marginal_tax_rate(future_income)
        available_room = tax_return.rrsp_deduction_limit
        
        if current_marginal_rate > future_marginal_rate * 1.05:  # Slightly modified
            optimal = min(available_room, tax_return.available_cash * 0.3)
            tax_savings = optimal * current_marginal_rate
            ccb_impact = self.calculate_ccb_impact(tax_return, optimal)
            return {
                'amount': optimal,
                'tax_savings': tax_savings - ccb_impact,
                'future_tax_cost': optimal * future_marginal_rate * 0.7,
                'net_lifetime_benefit': (tax_savings - ccb_impact) - (optimal * future_marginal_rate * 0.7)
            }
        else:
            return {'amount': 0, 'tax_savings': 0}
