##
# @file state.py
# @author Lukas Koszegy
# @brief Implementacia stavov
##

from enum import Enum, unique, auto

@unique
class testState(Enum):
    #TestResult code 0-99
    OK = 0
    COUNT_EVENTS = auto()
    FAILED = auto()

    #TestState code 100-199
    INITIALIZE = 100
    TESTING = auto()
    ANALYZE = auto()
