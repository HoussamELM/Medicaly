import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
    const { currentUser, doctorName } = useAuth(); // Access doctorName from AuthContext

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/';
    };

    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const [navButton, setNavButton] = useState(false);
    const handleNavButtonClick = () => {
        setNavButton(!navButton);
    };

    return (
        <div className=' text-white flex justify-center items-center flex-col'>
            <div className="flex justify-between items-center flex-row w-4/5 px-1.5 pt-4 pb-2">
                <a className="text-gray-400 flex items-center" href='tel:0619834123'>
                    <EmailIcon style={{ marginRight: '8px' }} />
                    Contact@Medicaly.ma
                </a>
                <a className="text-gray-400 flex items-center" href='tel:0619834123'>
                    <WhatsAppIcon style={{ marginRight: '8px' }} />
                    Contactez-Nous Sur Whatsapp
                </a>
            </div>
            <AppBar position="static" sx={{ mt: 0, width: '80%', height: 86, justifyContent: 'center' }} >
                <Toolbar>
                    {currentUser && (
                        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" sx={{ display: 'inline', mr: 2 }}>
                               Bienvenue Dr. {capitalizeFirstLetter(doctorName)}
                            </Typography>
                            <Button color="inherit" variant="outlined" onClick={handleLogout}>Déconnexion</Button>
                        </Box>
                    )}
                    {!currentUser && (
                        <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                            <Button component={Link} to="/" variant="none" color="primary" sx={{ mr: 2 }}>
                                Medicaly
                            </Button>
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