import React from 'react';
import { Header as Title, Menu, Popup } from 'semantic-ui-react';
import '../css/header.css';

const Header = ({rightBar, createApp, title}) => (
    <div className='header'>
    <Menu inverted size='large' icon fixed='top' >
        <Popup
           trigger={<Menu.Item
                    link
                    icon='content'
                    position='left'
                    onClick={rightBar}
                    ></Menu.Item>}
            content='Show menu'
            size='mini' inverted />
        <Title as='h3' inverted color='black' attached='bottom' content={title} textAlign='center' />
        <Popup
            trigger={<Menu.Item
                    link
                    icon='add'
                    position='right'
                    onClick={createApp}
                    ></Menu.Item>}
            content='Create application'
            size='mini' inverted />
    </Menu>
    </div>
);

export default Header;
