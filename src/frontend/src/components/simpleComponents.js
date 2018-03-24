import React from 'react'
import { Input } from 'semantic-ui-react';

const semanticFilter = ({filter, onChange}, type='text') => (
    <Input icon='search' type={type} value={filter ? filter.value : ''}
            onChange={event => onChange(event.target.value)} />
)

const semanticDateRangeFilter = ({filter, onChange}, obj) => (
    <div>
        <Input name='start' className='dateRange' type='date'
                value={filter && filter.value[1] === 'start' ? filter.value[0] : obj.state.startDate}
                onChange={event => onChange([event.target.value, 'start'])} />
        <Input className='dateRange' type='date'
                value={filter && filter.value[1] === 'end' ? filter.value[0] : obj.state.endDate}
                onChange={event => onChange([event.target.value, 'end'])} />
    </div>
)

export {
    semanticFilter,
    semanticDateRangeFilter
}
