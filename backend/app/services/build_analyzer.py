from typing import Dict, Any, List
from sqlalchemy.orm import Session
import re
import json

from app.models.build import Build


def analyze_build_failure(logs: str, error_message: str = None) -> Dict[str, Any]:
    """
    Analyze build logs and error message to determine cause of failure and suggest fixes.
    
    This is a placeholder implementation that would be replaced with a more sophisticated
    analysis using NLP or ML models in production.
    """
    analysis = {
        "detected_patterns": [],
        "suggested_fix": "",
        "confidence_score": 0.5,
        "related_files": [],
        "root_cause": "",
    }
    
    # Simple pattern matching for common failure types
    patterns = [
        {
            "pattern": r"npm ERR! 404.*not found",
            "error_type": "Missing NPM Package",
            "fix": "Check package name and version in package.json. Ensure the package exists in the registry.",
            "confidence": 0.8
        },
        {
            "pattern": r"No space left on device",
            "error_type": "Disk Space",
            "fix": "Free up disk space on the build agent or increase disk allocation.",
            "confidence": 0.9
        },
        {
            "pattern": r"FATAL: command execution failed.*timed out",
            "error_type": "Build Timeout",
            "fix": "Optimize your build process or increase the timeout limit.",
            "confidence": 0.7
        },
        {
            "pattern": r"Could not resolve dependencies for project",
            "error_type": "Dependency Resolution",
            "fix": "Check your dependency versions for conflicts. Ensure all repositories are accessible.",
            "confidence": 0.8
        },
        {
            "pattern": r"permission denied",
            "error_type": "Permission Issue",
            "fix": "Check file permissions or CI/CD service account permissions.",
            "confidence": 0.8
        },
        {
            "pattern": r"failed to compile",
            "error_type": "Compilation Error",
            "fix": "Check the error message for specific file and line number, fix the syntax error.",
            "confidence": 0.7
        },
        {
            "pattern": r"test.*failed",
            "error_type": "Test Failure",
            "fix": "Review failing test cases and address the underlying code issues.",
            "confidence": 0.7
        },
    ]
    
    if logs:
        for pattern_def in patterns:
            if re.search(pattern_def["pattern"], logs, re.IGNORECASE):
                analysis["detected_patterns"].append(pattern_def["pattern"])
                analysis["error_type"] = pattern_def["error_type"]
                analysis["suggested_fix"] = pattern_def["fix"]
                analysis["confidence_score"] = pattern_def["confidence"]
                analysis["root_cause"] = f"Detected {pattern_def['error_type']} pattern in logs"
    
    # If no patterns matched but we have an error message, use that
    if not analysis["detected_patterns"] and error_message:
        analysis["root_cause"] = f"Unknown error: {error_message}"
        analysis["suggested_fix"] = "Review the error message and logs for more details."
    
    # If we still don't have a root cause, set a generic one
    if not analysis.get("root_cause"):
        analysis["root_cause"] = "Unknown issue, manual investigation required"
        analysis["suggested_fix"] = "Review the full build logs for more details."
    
    return analysis


def get_similar_failures(db: Session, build: Build, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Find similar failures based on error type or patterns.
    
    This is a placeholder implementation that would be replaced with a more sophisticated
    similarity search in production.
    """
    # In a real implementation, this would use embeddings or other techniques
    # to find semantically similar failures
    similar_builds = db.query(Build).filter(
        Build.id != build.id,
        Build.user_id == build.user_id,
        Build.status == "failure",
        Build.error_type == build.error_type
    ).limit(limit).all()
    
    result = []
    for similar in similar_builds:
        result.append({
            "id": similar.id,
            "build_id": similar.build_id,
            "repository": similar.repository,
            "branch": similar.branch,
            "error_message": similar.error_message,
            "started_at": similar.started_at.isoformat(),
            "similarity_score": 0.8,  # Placeholder score
        })
    
    return result
