import React, { Component } from 'react';
import Header from './components/header';
//import RightBar from './components/right-bar';
import { CreateApp } from './components/form.js';
import { ToastContainer } from 'react-toastify';
import { ListApp } from './components/listApp.js';

class App extends Component {
    constructor(props) {
        super(props);
        this.changeRightBar = this.rightBarChange.bind(this);
        this.changeCreateApp = this.createAppChange.bind(this);
        this.state = {
            rightBar: false,
            createScenario: false
        }
    }

    rightBarChange() {
        this.setState({
            rightBar: !this.state.rightBar
        });
    }

    createAppChange() {
        this.setState({
            createApp: !this.state.createApp
        });
    }

    render() {
        let createApp = null;
        if (this.state.createApp)
            createApp = <CreateApp changeFormState={this.changeCreateApp}/>;

        return (
            <div className='main'>
                <Header rightBar={this.changeRightBar} createApp={this.changeCreateApp} />
                {createApp}
                <div className='body'>
                   <ListApp />
                </div>
                <ToastContainer autoclose={20000} />
            </div>
        );
    }
}

export default App;
