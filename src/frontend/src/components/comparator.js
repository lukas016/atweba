import React, { Component } from 'react';
import { Button, Input, Select } from 'semantic-ui-react';
import ImageDiff from 'react-image-diff'
import '../css/comparator.css'

class Comparator extends Component {
    constructor(props) {
        super(props)
        this.state = {range: 0.5, type: 'difference'}
        this.type = ['fade', 'difference', 'swipe'].map(x => ({key: x, text: x, value: x}))
    }

    changeRange = (e, {value}) => this.setState({range: parseFloat(value)})

    changeType = (e, {value}) => this.setState({type: value})

    render() {
        const {range, type} = this.state
        return (
            <div>
                <div className='controlPanel'>
                    <Select placeholder='Type of diff image' options={this.type}
                        onChange={this.changeType}/>
                    <Input disabled={type === 'difference'} type='range' min={0} max={1} value={range} step={0.01}
                        onChange={this.changeRange}/>{range}
                </div>
            <ImageDiff before={this.props.before} after={this.props.after} type={type} value={range} />
            </div>
        )
    }
};

export default Comparator
