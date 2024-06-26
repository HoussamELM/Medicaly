import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

const Header = () => {
    const { currentUser, doctorName } = useAuth(); // Access doctorName from AuthContext

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/';
    };

    const [navButton, setNavButton] = useState(false);
    const handleNavButtonClick = () => {
        setNavButton(!navButton);
    };

    return (
        <div className=' text-white flex justify-center items-center flex-col h-[15vh]'>
            <div className="flex justify-between items-center flex-row w-full px-1.5 pt-4 pb-2">
                <a className="text-gray-400 flex items-center" href='tel:0619834123'>
                    <EmailIcon style={{ marginRight: '8px' }} />
                    Contact@Medicaly.ma
                </a>
                <a className="text-gray-400 flex items-center" href='tel:0619834123'>
                    <WhatsAppIcon style={{ marginRight: '8px' }} />
                    Contactez-Nous Sur Whatsapp
                </a>
            </div>
            <AppBar position="static" sx={{ mt: 0, height: 86, justifyContent: 'center', borderRadius: '8px' }} >
                <Toolbar>
                    {currentUser && (
                        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                            <div className='flex justify-center items-center flex-col w-[50px] h-[50px] bg-slate-100 rounded-full'>
                                <MonitorHeartIcon color="primary" />
                            </div>
                            <Button color="inherit" variant="outlined" onClick={handleLogout}>Déconnexion</Button>
                        </Box>
                    )}
                    {!currentUser && (
                        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                            <div className='flex justify-center items-center flex-col w-[50px] h-[50px] bg-slate-100 rounded-full'>
                                <MonitorHeartIcon color="primary" />
                            </div>
                            {navButton ? (
                                <Button onClick={handleNavButtonClick} component={Link} to="/" variant="outlined" color="white" size="large">
                                    Espace Client
                                </Button>
                            ) :
                                <Button onClick={handleNavButtonClick} component={Link} to="/doctor-login" variant="outlined" color="white" size="large">
                                    Espace Docteur
                                </Button>
                            }
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default Header;