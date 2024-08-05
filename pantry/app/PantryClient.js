'use client';

console.log("PantryClient component loaded");

import { Box, Stack, Typography, Button, Modal, TextField, AppBar, Toolbar, Paper, Chip, IconButton, Badge, Select, 
        MenuItem, InputLabel, FormControl, Alert, CircularProgress } from '@mui/material';
import { AccountCircle, Search } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { firestore } from '@/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import useAuth from './auth';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function PantryClient() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  const { user, error, handleSignUp, handleLogin, handleGoogleSignIn, handleLogout, setError } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [itemDescription, setItemDescription] = useState('');

  const [suggestedDescription, setSuggestedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => {
    if (user) {
      setOpen(true);
    } else {
      setLoginMessage('Please log in to add an item to the pantry.');
    }
  };

  const handleClose = () => setOpen(false);

  const handleAuthClose = () => {
    setAuthModalOpen(false);
    setIsSignUp(false);
    setError('');
  };

  const updatePantry = useCallback(async () => {
    if (user) {
      const userPantryRef = collection(firestore, 'users', user.uid, 'pantry');
      const snapshot = await getDocs(query(userPantryRef));
      const pantryList = [];
      snapshot.forEach((doc) => {
        pantryList.push({ name: doc.id, ...doc.data() });
      });
      setPantry(pantryList);
    } else {
      setPantry([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      updatePantry();
      setLoginMessage('');
    } else {
      setPantry([]);
    }
  }, [user, updatePantry]);

  const addItem = async (item) => {
    if (user) {
      const normalizedItem = item.toLowerCase();
      const itemRef = doc(firestore, 'users', user.uid, 'pantry', normalizedItem);
      const docSnap = await getDoc(itemRef);
      const descriptionToUse = itemDescription || suggestedDescription;
      if (docSnap.exists()) {
        const { count, description } = docSnap.data();
        await setDoc(itemRef, { count: count + 1, description: description || descriptionToUse });
      } else {
        await setDoc(itemRef, { count: 1, description: descriptionToUse });
      }
      await updatePantry();
    }
  };

  const removeItem = async (item) => {
    if (user) {
      const normalizedItem = item.toLowerCase();
      const itemRef = doc(firestore, 'users', user.uid, 'pantry', normalizedItem);
      const docSnap = await getDoc(itemRef);
      if (docSnap.exists()) {
        const { count, description } = docSnap.data();
        if (count === 1) {
          await deleteDoc(itemRef);
        } else {
          await setDoc(itemRef, { count: count - 1, description });
        }
      }
      await updatePantry();
    }
  };

  const filteredPantry = pantry.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedFilter === 'All' || item.description === selectedFilter)
  );

  const getSuggestedDescription = async (itemName) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/suggest-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSuggestedDescription(data.suggestion);
    } catch (error) {
      console.error('Error getting suggestion:', error);
      setError(`Failed to get suggestion: ${error.message}`);
      setSuggestedDescription('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (itemName) {
      getSuggestedDescription(itemName);
    }
  }, [itemName]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <AppBar position="fixed" sx={{ bgcolor: "primary.main", boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'black' }}>
            Pantry
          </Typography>
          {!user && (
            <div>
              <Button
                color="inherit"
                variant="contained"
                sx={{ color: 'black', mr: 2 }}
                onClick={() => {
                  setIsSignUp(true);
                  setAuthModalOpen(true);
                }}
              >
                Sign Up
              </Button>
              <Button
                color="inherit"
                variant="contained"
                sx={{ color: 'black' }}
                onClick={() => {
                  setIsSignUp(false);
                  setAuthModalOpen(true);
                }}
              >
                Login
              </Button>
            </div>
          )}
          {user && (
            <IconButton sx={{ position: 'absolute', top: 10, right: 10 }} onClick={() => setProfileOpen(true)}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={<div style={{ backgroundColor: 'green', width: 10, height: 10, borderRadius: 5 }} />}
              >
                <AccountCircle />
              </Badge>
            </IconButton>
          )}
          <Modal
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            aria-labelledby="profile-modal-title"
            aria-describedby="profile-modal-description"
          >
            <Box sx={style}>
              <Typography id="profile-modal-title" variant="h6" component="h2">
                Profile
              </Typography>
              {user && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Signed in as: {user.email}
                </Typography>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={async () => {
                  const success = await handleLogout();
                  if (success) {
                    setProfileOpen(false); // Close the profile modal
                  }
                }}
                sx={{ mt: 2 }}
              >
                Log Out
              </Button>
            </Box>
          </Modal>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 8 }}>
        <Paper elevation={3} sx={{ width: '800px', height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s ease-in-out',
            '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', bgcolor: '#f7f7f7' } }}>
          <Box sx={{ bgcolor: '#ADD8E6', p: 2, transition: 'background-color 0.3s ease-in-out', ':hover': { bgcolor: '#9CC8D6' } }}>
            <Typography variant="h4" align="center" sx={{ color: '#333' }}>
              Pantry Items
            </Typography>
          </Box>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              variant="outlined"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search />,
              }}
            />
            <Select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Fruit">Fruit</MenuItem>
              <MenuItem value="Vegetable">Vegetable</MenuItem>
              <MenuItem value="Dairy">Dairy</MenuItem>
              <MenuItem value="Grain">Grain</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </Box>

          {loginMessage && (
            <Box sx={{ p: 2 }}>
              <Alert severity="warning">{loginMessage}</Alert>
            </Box>
          )}

          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <Stack spacing={2}>
              {filteredPantry.map(({ name, count, description }) => (
                <Paper key={name} elevation={1} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { transform: 'translateX(5px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }}
                >
                  <Box>
                    <Typography variant="h6">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="caption">{description}</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Button size="small" onClick={() => removeItem(name)} sx={{ minWidth: '36px', height: '36px', borderRadius: '50%', p: 0 }}>
                      <RemoveIcon />
                    </Button>

                    <Chip label={count} color="primary" sx={{ height: '36px', width: '50px', borderRadius: '18px', fontSize: '1rem', fontWeight: 'bold' }}/>
                    
                    <Button size="small" onClick={() => addItem(name)} sx={{ minWidth: '36px', height: '36px', borderRadius: '50%', p: 0 }}>
                      <AddIcon />
                    </Button>
                  </Box>

                </Paper>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button variant="contained" fullWidth onClick={handleOpen} sx={{ transition: 'all 0.2s ease-in-out',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' } }}>
              Add Item
            </Button>
          </Box>

        </Paper>

      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" marginBottom={0.5}>
            Add Item
          </Typography>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <FormControl fullWidth sx={{ mt: 2, position: 'relative' }}>
          <InputLabel id="description-label">Description</InputLabel>
          <Select
            labelId="description-label"
            value={itemDescription || suggestedDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            label="Description"
            disabled={isLoading}
          >
            {suggestedDescription && ( 
              <MenuItem value={suggestedDescription}>
                {suggestedDescription}
              </MenuItem>
            )}
            <MenuItem value="Fruit">Fruit</MenuItem>
            <MenuItem value="Vegetable">Vegetable</MenuItem>
            <MenuItem value="Dairy">Dairy</MenuItem>
            <MenuItem value="Grain">Grain</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
            {isLoading && (
                <CircularProgress
                size={24}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 30,
                    marginTop: '-12px',
                    marginLeft: '-12px',
                }}
                /> 
            )}
        </FormControl>

          <Button
            variant="contained"
            onClick={() => {
              addItem(itemName);
              setItemName('');
              setItemDescription('');
              setSuggestedDescription('')
              handleClose();
            }}
            sx={{ mt: 2 }}
          >
            Add
          </Button>
        </Box>
      </Modal>

      {/* Authentication */}
      <Modal
        open={authModalOpen}
        onClose={handleAuthClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" marginBottom={0.5}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </Typography>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" onClick={isSignUp ? () => handleSignUp(email, password, handleAuthClose) : () => handleLogin(email, password, handleAuthClose)}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleGoogleSignIn(handleAuthClose)}>
            Sign in with Google
          </Button>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
}