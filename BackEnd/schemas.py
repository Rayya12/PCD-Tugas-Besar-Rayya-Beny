from pydantic import BaseModel

class Operation(BaseModel):
    type : str
    params : dict
    
class ProcessRequest(BaseModel):
    image_base64 : str
    operation : list[Operation]