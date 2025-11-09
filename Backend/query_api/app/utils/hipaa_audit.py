"""
HIPAA-compliant audit logging for PHI access tracking.

Required by: 45 CFR §164.312(b) - Audit Controls
"""
from typing import Optional, Dict, Any
from datetime import datetime
from google.cloud import firestore
from fastapi import Request
import uuid


class HIPAAAuditLogger:
    """Audit logger for HIPAA compliance."""

    def __init__(self, db: firestore.Client):
        """Initialize audit logger."""
        self.db = db
        self.collection = "audit_logs"

    def log_phi_access(
        self,
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        success: bool = True,
        request: Optional[Request] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Log PHI access event.

        Args:
            user_id: User performing action
            action: Action performed (view, create, update, delete, query, export)
            resource_type: Type of resource (document, chunk, chat, user_profile)
            resource_id: ID of resource accessed
            success: Whether action succeeded
            request: FastAPI request object (for IP, user agent)
            metadata: Additional context

        Returns:
            Audit log ID
        """
        log_id = str(uuid.uuid4())
        timestamp = datetime.utcnow()

        # Extract request details
        ip_address = None
        user_agent = None
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")

        audit_entry = {
            "log_id": log_id,
            "timestamp": timestamp,
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "success": success,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "metadata": metadata or {},
        }

        # Store in Firestore (append-only collection)
        self.db.collection(self.collection).document(log_id).set(audit_entry)

        return log_id

    def log_authentication(
        self,
        user_id: str,
        auth_method: str,
        success: bool,
        request: Optional[Request] = None,
        failure_reason: Optional[str] = None,
    ) -> str:
        """Log authentication attempt."""
        return self.log_phi_access(
            user_id=user_id,
            action="authentication",
            resource_type="auth",
            resource_id=user_id,
            success=success,
            request=request,
            metadata={
                "auth_method": auth_method,
                "failure_reason": failure_reason,
            },
        )

    def log_document_view(
        self,
        user_id: str,
        document_id: str,
        request: Optional[Request] = None,
    ) -> str:
        """Log document view (PHI access)."""
        return self.log_phi_access(
            user_id=user_id,
            action="document_view",
            resource_type="document",
            resource_id=document_id,
            success=True,
            request=request,
        )

    def log_document_delete(
        self,
        user_id: str,
        document_id: str,
        request: Optional[Request] = None,
        chunks_deleted: int = 0,
    ) -> str:
        """Log document deletion (PHI disposal)."""
        return self.log_phi_access(
            user_id=user_id,
            action="document_delete",
            resource_type="document",
            resource_id=document_id,
            success=True,
            request=request,
            metadata={"chunks_deleted": chunks_deleted},
        )

    def log_query(
        self,
        user_id: str,
        query_text: str,
        documents_accessed: list,
        request: Optional[Request] = None,
    ) -> str:
        """Log RAG query (PHI access via search)."""
        return self.log_phi_access(
            user_id=user_id,
            action="rag_query",
            resource_type="query",
            resource_id=str(uuid.uuid4()),  # Query doesn't have stable ID
            success=True,
            request=request,
            metadata={
                "query_length": len(query_text),
                "documents_accessed": documents_accessed[:10],  # Limit to 10
                "num_documents": len(documents_accessed),
            },
        )

    def log_failed_access(
        self,
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        reason: str,
        request: Optional[Request] = None,
    ) -> str:
        """Log failed access attempt (security monitoring)."""
        return self.log_phi_access(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            success=False,
            request=request,
            metadata={"failure_reason": reason},
        )

    def get_user_access_history(
        self,
        user_id: str,
        limit: int = 100,
        action_filter: Optional[str] = None,
    ) -> list:
        """
        Get access history for a user (for audit review).

        Args:
            user_id: User ID
            limit: Max number of logs to return
            action_filter: Filter by specific action

        Returns:
            List of audit log entries
        """
        query = self.db.collection(self.collection).where("user_id", "==", user_id)

        if action_filter:
            query = query.where("action", "==", action_filter)

        query = query.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(
            limit
        )

        logs = []
        for doc in query.stream():
            logs.append(doc.to_dict())

        return logs

    def get_resource_access_history(
        self,
        resource_type: str,
        resource_id: str,
        limit: int = 100,
    ) -> list:
        """
        Get access history for a specific resource (e.g., who viewed this document).

        Args:
            resource_type: Type of resource
            resource_id: Resource ID
            limit: Max number of logs

        Returns:
            List of audit log entries
        """
        query = (
            self.db.collection(self.collection)
            .where("resource_type", "==", resource_type)
            .where("resource_id", "==", resource_id)
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(limit)
        )

        logs = []
        for doc in query.stream():
            logs.append(doc.to_dict())

        return logs

    def get_failed_access_attempts(
        self,
        hours: int = 24,
        limit: int = 100,
    ) -> list:
        """
        Get recent failed access attempts (security monitoring).

        Args:
            hours: Look back this many hours
            limit: Max logs to return

        Returns:
            List of failed access attempts
        """
        cutoff_time = datetime.utcnow().timestamp() - (hours * 3600)

        query = (
            self.db.collection(self.collection)
            .where("success", "==", False)
            .order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(limit)
        )

        logs = []
        for doc in query.stream():
            log_data = doc.to_dict()
            # Filter by time in application (Firestore doesn't support timestamp comparison easily)
            if log_data["timestamp"].timestamp() >= cutoff_time:
                logs.append(log_data)

        return logs
