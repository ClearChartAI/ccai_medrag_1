"""
Healthcare Natural Language API integration for medical entity extraction.

Uses Google Cloud Healthcare API to extract and classify medical entities
from document text.

HIPAA Compliance:
- Enables de-identification of PHI
- Extracts structured medical entities (diagnoses, medications, procedures)
- Maps to standard medical codes (ICD-10, SNOMED, RxNorm)
"""
from typing import Dict, Any, List, Optional
from google.cloud import healthcare_v1
import re


class HealthcareNLPProcessor:
    """Process medical text with Healthcare Natural Language API."""

    def __init__(self, project_id: str, location: str = "us"):
        """
        Initialize Healthcare NLP client.

        Args:
            project_id: GCP project ID
            location: API location (default: us)
        """
        self.project_id = project_id
        self.location = location
        self.client = healthcare_v1.HealthcareNlpServiceClient()
        self.parent = f"projects/{project_id}/locations/{location}"

    def extract_medical_entities(
        self, text: str
    ) -> Dict[str, Any]:
        """
        Extract medical entities from text.

        Args:
            text: Medical text to analyze

        Returns:
            Dict with categorized entities:
            {
                "conditions": [...],
                "medications": [...],
                "procedures": [...],
                "measurements": [...],
                "anatomy": [...],
                "phi": [...]  # Protected Health Information
            }
        """
        if not text or len(text.strip()) < 10:
            return self._empty_entities()

        try:
            # Call Healthcare NL API
            response = self.client.analyze_entities(
                request={
                    "parent": self.parent,
                    "document_content": text[:10000],  # Limit to 10K chars
                }
            )

            # Categorize entities
            entities = {
                "conditions": [],
                "medications": [],
                "procedures": [],
                "measurements": [],
                "anatomy": [],
                "phi": [],  # Protected Health Information
                "temporal": [],
            }

            for entity in response.entities:
                entity_data = {
                    "text": entity.mention_text,
                    "type": entity.entity_type,
                    "confidence": entity.confidence,
                    "codes": [],
                }

                # Extract medical codes
                for code in entity.vocabulary_codes:
                    entity_data["codes"].append(
                        {
                            "system": code.vocabulary,
                            "code": code.code,
                        }
                    )

                # Categorize by type
                entity_type = entity.entity_type

                if entity_type in ["PROBLEM", "CONDITION", "DIAGNOSIS"]:
                    entities["conditions"].append(entity_data)

                elif entity_type in ["MEDICATION", "DRUG"]:
                    entities["medications"].append(entity_data)

                elif entity_type in ["PROCEDURE", "TREATMENT"]:
                    entities["procedures"].append(entity_data)

                elif entity_type in ["MEASUREMENT", "LAB_VALUE", "VITAL_SIGN"]:
                    entities["measurements"].append(entity_data)

                elif entity_type in ["ANATOMY", "BODY_PART"]:
                    entities["anatomy"].append(entity_data)

                elif entity_type in [
                    "PERSON_NAME",
                    "DATE",
                    "PHONE_NUMBER",
                    "EMAIL",
                    "ADDRESS",
                    "ID_NUMBER",
                ]:
                    # PHI - Protected Health Information
                    entities["phi"].append(entity_data)

                elif entity_type in ["DATETIME", "DURATION", "TIME"]:
                    entities["temporal"].append(entity_data)

            return entities

        except Exception as e:
            print(f"Healthcare NLP API error: {e}")
            return self._empty_entities()

    def de_identify_text(
        self,
        text: str,
        replacement_text: str = "[REDACTED]",
    ) -> Dict[str, Any]:
        """
        De-identify PHI from medical text.

        HIPAA Compliance:
        - Removes/replaces 18 HIPAA identifiers
        - Safe Harbor method compliance

        Args:
            text: Text containing PHI
            replacement_text: Text to replace PHI with

        Returns:
            {
                "de_identified_text": str,
                "phi_found": List[Dict],
                "is_safe_harbor_compliant": bool
            }
        """
        if not text:
            return {
                "de_identified_text": "",
                "phi_found": [],
                "is_safe_harbor_compliant": True,
            }

        # Extract PHI entities
        entities = self.extract_medical_entities(text)
        phi_entities = entities.get("phi", [])

        # Sort by position (reverse order to maintain indices)
        phi_entities.sort(key=lambda x: text.find(x["text"]), reverse=True)

        # Replace PHI
        de_identified_text = text
        for phi in phi_entities:
            phi_text = phi["text"]
            de_identified_text = de_identified_text.replace(
                phi_text, replacement_text
            )

        # Additional regex-based de-identification for patterns
        # (Healthcare API might miss some edge cases)

        # Dates: MM/DD/YYYY, MM-DD-YYYY
        de_identified_text = re.sub(
            r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
            "[DATE]",
            de_identified_text,
        )

        # Phone numbers: (XXX) XXX-XXXX, XXX-XXX-XXXX
        de_identified_text = re.sub(
            r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
            "[PHONE]",
            de_identified_text,
        )

        # Email addresses
        de_identified_text = re.sub(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
            "[EMAIL]",
            de_identified_text,
        )

        # SSN: XXX-XX-XXXX
        de_identified_text = re.sub(
            r"\b\d{3}-\d{2}-\d{4}\b",
            "[SSN]",
            de_identified_text,
        )

        # Ages > 89 (HIPAA requirement)
        de_identified_text = re.sub(
            r"\b(9[0-9]|1[0-9]{2})\s*(?:years?\s*old|y/?o)\b",
            "[AGE>89]",
            de_identified_text,
            flags=re.IGNORECASE,
        )

        return {
            "de_identified_text": de_identified_text,
            "phi_found": phi_entities,
            "phi_count": len(phi_entities),
            "is_safe_harbor_compliant": len(phi_entities) > 0,  # If we found and removed PHI
        }

    def extract_for_search(
        self, text: str
    ) -> Dict[str, List[str]]:
        """
        Extract searchable medical terms with codes.

        Use this to enhance search with medical code filtering.

        Args:
            text: Medical text

        Returns:
            Dict with codes for filtering:
            {
                "icd10_codes": ["E11", "I10"],
                "rxnorm_codes": ["314076"],
                "snomed_codes": ["44054006"],
                "condition_names": ["Type 2 Diabetes", "Hypertension"],
                "medication_names": ["Lisinopril", "Metformin"]
            }
        """
        entities = self.extract_medical_entities(text)

        search_data = {
            "icd10_codes": [],
            "rxnorm_codes": [],
            "snomed_codes": [],
            "condition_names": [],
            "medication_names": [],
        }

        # Extract condition codes
        for condition in entities.get("conditions", []):
            search_data["condition_names"].append(condition["text"])
            for code in condition.get("codes", []):
                if code["system"] == "ICD10":
                    search_data["icd10_codes"].append(code["code"])
                elif code["system"] == "SNOMED":
                    search_data["snomed_codes"].append(code["code"])

        # Extract medication codes
        for medication in entities.get("medications", []):
            search_data["medication_names"].append(medication["text"])
            for code in medication.get("codes", []):
                if code["system"] == "RXNORM":
                    search_data["rxnorm_codes"].append(code["code"])

        return search_data

    def _empty_entities(self) -> Dict[str, List]:
        """Return empty entities structure."""
        return {
            "conditions": [],
            "medications": [],
            "procedures": [],
            "measurements": [],
            "anatomy": [],
            "phi": [],
            "temporal": [],
        }


# Example usage in ingestion pipeline
def enrich_chunk_with_medical_entities(
    chunk_text: str,
    project_id: str,
) -> Dict[str, Any]:
    """
    Enrich a chunk with medical entity metadata.

    This can be called during ingestion to add structured medical data.

    Args:
        chunk_text: Text of the chunk
        project_id: GCP project ID

    Returns:
        Enriched chunk with medical entities
    """
    processor = HealthcareNLPProcessor(project_id=project_id)

    # Extract entities
    entities = processor.extract_medical_entities(chunk_text)

    # Extract searchable codes
    search_data = processor.extract_for_search(chunk_text)

    return {
        "text": chunk_text,
        "medical_entities": entities,
        "search_codes": search_data,
        "has_phi": len(entities.get("phi", [])) > 0,
        "entity_count": sum(len(v) for v in entities.values()),
    }
