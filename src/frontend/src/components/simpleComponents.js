import React from 'react'
import { Input } from 'semantic-ui-react';

const semanticFilter = ({filter, onChange}, type='text') => (
    <Input icon='search' type={type} value={filter ? filter.value : ''}
            onChange={event => onChange(event.target.value)} />
)

export {
    semanticFilter
}
