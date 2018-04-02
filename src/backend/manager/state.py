from enum import Enum, unique, auto

@unique
class testState(Enum):
    #TestResult code 0-99
    OK = 0
    COUNT_EVENTS = auto()
    FAILED = auto()

    #TestState code 100-199
    TESTING = 100
    ANALYZE = auto()
