import React from 'react';
import { Sidebar, Segment, Header, Menu, Icon } from 'semantic-ui-react';
import '../css/header.css';

const RightBar = ({visible}) => (
    <div className='body'>
    <Sidebar.Pushable as={Segment}>
        <Sidebar as={Menu} animation='uncover' width='very thin' visible={visible} icon='labeled' vertical inverted>
            <Menu.Item name='home' inverted>
                <Icon name='home' />
            </Menu.Item>
        </Sidebar>
        <Sidebar.Pusher dimmed>
            <Segment basic>
                <Header as='h3'>Application Content</Header>
            </Segment>
        </Sidebar.Pusher>
    </Sidebar.Pushable>
    </div>
)

export default RightBar
