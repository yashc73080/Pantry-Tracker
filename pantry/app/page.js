'use client'
import { Box, Stack, Typography, Button, Modal, TextField, AppBar, Toolbar, Container, Paper } from '@mui/material'
import { firestore } from '@/firebase' 
import { collection, query, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

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

export default function Home() {
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('') 

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({"name": doc.id, ...doc.data()})
    }) 
    setPantry(pantryList)
  }

  useEffect(() => {
    updatePantry()
  }, [])

  const addItem = async (item) => {
    const normalizedItem = item.toLowerCase();
    const docRef = doc(collection(firestore, 'pantry'), normalizedItem)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count + 1})
    } else {
      await setDoc(docRef, {count: 1})
    }
    await updatePantry()
  }

  const removeItem = async (item) => {
    const normalizedItem = item.toLowerCase();
    const docRef = doc(collection(firestore, 'pantry'), normalizedItem)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      if (count === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {count: count - 1})
      }
    }
    await updatePantry()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'black' }}>
            LOGO
          </Typography>
          <Button color="inherit" sx={{ color: 'black' }}>Sign Up</Button>
          <Button color="inherit" sx={{ color: 'black' }}>Login</Button>
        </Toolbar>
      </AppBar>
      
      <Box 
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pt: 8, // To account for the fixed AppBar
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            width: '800px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ bgcolor: '#ADD8E6', p: 2 }}>
            <Typography variant="h4" align="center" sx={{ color: '#333' }}>
              Pantry Items
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <Stack spacing={2}>
              {pantry.map(({name, count}) => (
                <Paper key={name} elevation={1} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      Quantity: {count}
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => removeItem(name)}>
                      Remove
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
          
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button variant="contained" fullWidth onClick={handleOpen}>
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
          <Button variant='contained' 
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}