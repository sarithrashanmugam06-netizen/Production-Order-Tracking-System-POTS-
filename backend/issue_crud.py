from sqlalchemy.orm import Session

import models
import schemas


# -------------------------
# GET ALL ISSUES
# -------------------------
def get_issues(db: Session):
    return db.query(models.Issue).all()


# -------------------------
# CREATE ISSUE
# -------------------------
def create_issue(db: Session, issue: schemas.Issue):
    db_issue = models.Issue(
        workorder_id=issue.workorder_id,
        issue_type=issue.issue_type,
        description=issue.description,
        severity=issue.severity,
        reported_date=issue.reported_date,
        status=issue.status,
    )

    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)

    return db_issue


# -------------------------
# UPDATE ISSUE
# -------------------------
def update_issue(db: Session, issue_id: int, issue: schemas.Issue):

    db_issue = (
        db.query(models.Issue)
        .filter(models.Issue.id == issue_id)
        .first()
    )

    if db_issue is None:
        return None

    db_issue.workorder_id = issue.workorder_id
    db_issue.issue_type = issue.issue_type
    db_issue.description = issue.description
    db_issue.severity = issue.severity
    db_issue.reported_date = issue.reported_date
    db_issue.status = issue.status

    db.commit()
    db.refresh(db_issue)

    return db_issue


# -------------------------
# DELETE ISSUE
# -------------------------
def delete_issue(db: Session, issue_id: int):

    db_issue = (
        db.query(models.Issue)
        .filter(models.Issue.id == issue_id)
        .first()
    )

    if db_issue is None:
        return None

    db.delete(db_issue)
    db.commit()

    return {"message": "Issue deleted successfully"}