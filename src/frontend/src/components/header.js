import React from 'react';
import { Menu, Popup } from 'semantic-ui-react';
import '../css/header.css';

const Header = ({rightBar, createScenario}) => (
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
        <Popup
            trigger={<Menu.Item
                    link
                    icon='add'
                    position='right'
                    onClick={createScenario}
                    ></Menu.Item>}
            content='Create scenario'
            size='mini' inverted />
    </Menu>
    </div>
);

export default Header;
