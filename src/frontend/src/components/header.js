import React from 'react';
import { Menu } from 'semantic-ui-react';
import '../css/header.css';

const Header = state => (
    <div className='header'>
    <Menu color='white' inverted size='large' icon fixed='top' >
        <Menu.Item
            link
            icon='content'
            position='left'
            color='black'
        ></Menu.Item>
        <Menu.Item
            link
            icon='add'
            position='right'
        ></Menu.Item>
    </Menu>
    </div>
);

export default Header;
