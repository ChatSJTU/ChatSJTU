
class ChatError(Exception):

    def __init__(self, error:str, status:int=500) -> None:
        self.error = error
        self.status = status
        return super().__init__(error)

    def __str__(self) -> str:
        return super().__str__()
