import React from 'react';
import { Menu } from 'semantic-ui-react';
import '../css/header.css';

const Header = ({rightBar}) => (
    <div className='header'>
    <Menu inverted size='large' icon fixed='top' >
        <Menu.Item
            link
            icon='content'
            position='left'
            onClick={rightBar}
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
