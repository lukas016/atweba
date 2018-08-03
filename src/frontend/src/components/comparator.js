/**
 * @file comparator.js
 * @author Lukas Koszegy
 * @brief Porovnavac obrazkov
 */

import React, { Component } from 'react';
import { Input, Select } from 'semantic-ui-react';
import ImageDiff from 'react-image-diff'
import '../css/comparator.css'

class Comparator extends Component {
    constructor(props) {
        super(props)
        this.state = {range: 0.5, zoom: 1.0, type: 'difference'}
        this.type = ['fade', 'difference', 'swipe'].map(x => ({key: x, text: x, value: x}))
    }

    // Zmena rozsahu pre porovnavacie metody
    changeRange = (e, {value}) => this.setState({range: parseFloat(value)})

    // Priblizenie na obrazok
    changeZoom = (e, {value}) => this.setState({zoom: parseFloat(value)})

    // Zmena metody porovnania obrazku
    changeType = (e, {value}) => this.setState({type: value})

    render() {
        const {range, type, zoom} = this.state

        // Zmena mierky k lavemu hornemu rohu
        const styleZoom = {
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
        }

        return (
            <div>
                <div className='controlPanel'>
                    <span>Type of diff</span>
                    <span>Control diff: {range}</span>
                    <span>Scale image: {zoom}</span><br/>
                    <Select compact options={this.type} onChange={this.changeType}/>
                    <Input disabled={type === 'difference'} type='range' min={0} max={1} value={range} step={0.01}
                        onChange={this.changeRange}/>
                    <Input type='range' min={0.25} max={1.5} value={zoom} step={0.01}
                        onChange={this.changeZoom}/>
                </div>
            <div style={styleZoom}>
            <ImageDiff before={this.props.before} after={this.props.after} type={type} value={range} />
            </div>
            </div>
        )
    }
};

export default Comparator
