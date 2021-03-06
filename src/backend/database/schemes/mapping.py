##
# @file mapping.py
# @author Lukas Koszegy
# @brief Definicie typov dokumentov pre inicializaciu DB
##

mappingApp = {
    'properties': {
        'created': {
            'type': 'date'
        },
        'domain': {
            'type': 'keyword'
        }
    }
}

mappingEvent = {
    'properties': {
        'appId': {
            'type': 'text',
            'fields': {
                'keyword': {
                    'type': 'keyword',
                    'ignore_above': 256
                }
            }
        },
        'content': {
            'type': 'text',
            'fields': {
                'keyword': {
                    'type': 'keyword',
                    'ignore_above': 256
                }
            }
        },
        'locator': {
            'type': 'text',
            'fields': {
                'keyword': {
                    'type': 'keyword',
                    'ignore_above': 256
                }
            }
        },
        'path': {
            'type': 'text',
            'fields': {
                'keyword': {
                    'type': 'keyword',
                    'ignore_above': 256
                }
            }
        },
        'scenarioId': {
            'type': 'text',
            'fields': {
                'keyword': {
                    'type': 'keyword',
                    'ignore_above': 2048
                }
            }
        },
        'timestamp': {
            'type': 'float'
        },
        'pageTime': {
            'type': 'float'
        },
        'screenX': {
            'type': 'short'
        },
        'screenY': {
            'type': 'short'
        },
        'type': {
            'type': 'text',
            'fields': {
                'keyword': {
                    'type': 'keyword',
                    'ignore_above': 256
                }
            }
        },
        'url': {
            'type': 'text',
            'fields': {
                'keyword': {
                    'type': 'keyword',
                    'ignore_above': 2048
                }
            }
        }
    }
}
