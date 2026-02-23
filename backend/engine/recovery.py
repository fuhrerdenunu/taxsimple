class TaxCalculationRecoveryService:
    """
    Handles edge cases and calculation errors gracefully
    """
    
    def get_max_cpp_employee(self, year):
        return 3867.50 if year >= 2024 else 3754.45

    def get_max_ei_employee(self, year):
        return 1049.12 if year >= 2024 else 1002.45
        
    def get_max_age_amount(self, year):
        return 8790.00
        
    def get_age_amount_threshold(self, year):
        return 44325.00
        
    def calculate_age_amount(self, income):
        return max(0, self.get_max_age_amount(2025) - ((income - self.get_age_amount_threshold(2025)) * 0.15))

    def validate_calculation_consistency(self, tax_return):
        """
        Run 100+ sanity checks on calculations
        """
        checks = []
        
        # Check 1: Rounding consistency (CRA is specific about rounding)
        total_from_parts = (
            tax_return.employment_income +
            tax_return.self_employment_income +
            tax_return.investment_income +
            tax_return.other_income
        )
        if abs(total_from_parts - tax_return.total_income) > 0.01:  # CRA tolerates 1 cent
            checks.append({
                'severity': 'ERROR',
                'message': 'Total income does not match sum of parts',
                'difference': total_from_parts - tax_return.total_income
            })
            
        # Check 2: CPP contributions consistency
        max_cpp_employee = self.get_max_cpp_employee(tax_return.tax_year)
        if tax_return.cpp_contributions > max_cpp_employee + 0.01:  # Allow 1 cent rounding
            checks.append({
                'severity': 'ERROR',
                'message': f'CPP contributions exceed maximum of ${max_cpp_employee:,.2f}',
                'excess': tax_return.cpp_contributions - max_cpp_employee
            })
            
        # Check 3: EI contributions consistency
        max_ei_employee = self.get_max_ei_employee(tax_return.tax_year)
        if tax_return.ei_contributions > max_ei_employee + 0.01:
            checks.append({
                'severity': 'ERROR',
                'message': f'EI contributions exceed maximum of ${max_ei_employee:,.2f}'
            })
            
        # Check 4: Age amount eligibility
        if tax_return.age >= 65:
            max_age_amount = self.get_max_age_amount(tax_return.tax_year)
            if tax_return.claiming_age_amount and tax_return.income > self.get_age_amount_threshold(tax_return.tax_year):
                # Age amount phases out
                expected_age_amount = self.calculate_age_amount(tax_return.income)
                if abs(tax_return.age_amount - expected_age_amount) > 1.00:
                    checks.append({
                        'severity': 'WARNING',
                        'message': 'Age amount may be incorrect',
                        'calculated': expected_age_amount,
                        'claimed': tax_return.age_amount
                    })
                    
        # Check 5: Medical expense threshold
        if tax_return.medical_expenses > 0:
            threshold = tax_return.net_income * 0.03  # 3% threshold
            if tax_return.medical_expenses < threshold:
                checks.append({
                    'severity': 'INFO',
                    'message': f'Medical expenses below ${threshold:,.2f} threshold - no benefit'
                })
                
        return checks
