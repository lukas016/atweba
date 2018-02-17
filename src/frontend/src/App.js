import React, { Component } from 'react';
import './App.css';
import Header from './components/header';
import RightBar from './components/right-bar';

class App extends Component {
    constructor(props) {
        super(props);
        this.changeRightBar = this.rightBarChange.bind(this);
        this.state = {
            rightBar: false
        }
    }
    rightBarChange() {
        this.setState({
            rightBar: !this.state.rightBar
        });
    }

    render() {
        let rightBar = null;
        if (this.state.rightBar)
            rightBar = <RightBar visible={this.state.rightBar} />;

        return (
            <div className='main'>
                <Header rightBar={this.changeRightBar} />
                <RightBar visible={this.state.rightBar} />
            </div>
        );
    }
}

export default App;
