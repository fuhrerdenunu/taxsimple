import uuid
import datetime

class NetfileService:
    """
    Handles CRA NETFILE generation and mock submission
    """
    
    def generate_xml(self, calculation_result, profile):
        """
        Mock generation of the .tax file XML equivalent.
        """
        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<T1Return>
    <SoftwareID>TAXSIMPLE-2025</SoftwareID>
    <Taxpayer>
        <SIN>{profile.get('sin', 'XXX-XXX-XXX')}</SIN>
        <FirstName>{profile.get('first_name', 'GivenName')}</FirstName>
        <LastName>{profile.get('last_name', 'Surname')}</LastName>
    </Taxpayer>
    <Summary>
        <TotalIncome>{calculation_result.get('total_income', 0):.2f}</TotalIncome>
        <NetIncome>{calculation_result.get('net_income', 0):.2f}</NetIncome>
        <TaxableIncome>{calculation_result.get('taxable_income', 0):.2f}</TaxableIncome>
        <RefundOrBalance>{calculation_result.get('refund_or_balance', 0):.2f}</RefundOrBalance>
    </Summary>
</T1Return>
"""
        return xml

    def submit(self, calculation_result, profile):
        """
        Mock submission endpoint matching PRD specs.
        """
        xml_payload = self.generate_xml(calculation_result, profile)
        
        # In a real app, this performs mutual TLS to https://netfile.cra-arc.gc.ca/netfile/2025/submit
        
        # Simulate success
        confirmation_code = str(uuid.uuid4()).upper()[:16]
        
        return {
            "status": "SUCCESS",
            "message": "Return successfully transmitted to the Canada Revenue Agency.",
            "confirmation_number": confirmation_code,
            "timestamp": datetime.datetime.now().isoformat(),
            "xml_preview": xml_payload
        }
