from enum import auto, IntEnum, unique
@unique

class Environment(IntEnum):
    DEVEL = 0
    TESTING = auto()
    PRODUCTION = auto()
