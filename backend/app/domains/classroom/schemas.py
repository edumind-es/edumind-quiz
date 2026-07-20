from pydantic import BaseModel

class AreaBase(BaseModel):
    name: str

class AreaCreate(AreaBase):
    proposal_id: int

class Area(AreaBase):
    id: int
    proposal_id: int

    class Config:
        from_attributes = True

class ProposalBase(BaseModel):
    name: str
    min_questions: int = 5
    num_options: int = 4

class ProposalCreate(ProposalBase):
    classroom_id: int

class Proposal(ProposalBase):
    id: int
    classroom_id: int

    class Config:
        from_attributes = True
