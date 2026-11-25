from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import access
import issue_crud
import models
import rules
import schemas
from database import get_db

router = APIRouter(prefix="/issues", tags=["Issues"])


@router.get("/", dependencies=[access.authenticated], response_model=List[schemas.IssueResponse])
def read_issues(db: Session = Depends(get_db)):
    return issue_crud.get_issues(db)


@router.post("/", dependencies=[access.ops_editor], response_model=schemas.IssueResponse, status_code=201)
def add_issue(issue: schemas.Issue, db: Session = Depends(get_db)):
    rules.require_workorder(db, issue.workorder_id)
    return issue_crud.create_issue(db, issue)


@router.put("/{issue_id}", dependencies=[access.ops_editor], response_model=schemas.IssueResponse)
def update_issue(
    issue_id: int,
    issue: schemas.Issue,
    db: Session = Depends(get_db),
):
    rules.get_or_404(db, models.Issue, issue_id, "Issue")
    rules.require_workorder(db, issue.workorder_id)
    return issue_crud.update_issue(db, issue_id, issue)


@router.delete("/{issue_id}", dependencies=[access.ops_editor])
def delete_issue(issue_id: int, db: Session = Depends(get_db)):
    rules.get_or_404(db, models.Issue, issue_id, "Issue")
    return issue_crud.delete_issue(db, issue_id)
