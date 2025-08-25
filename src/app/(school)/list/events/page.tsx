"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

export default function EventsPage() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const currentUser = useQuery(api.users.getCurrentUser);
  const isAdmin = currentUser?.role === "admin";
  
  const events = useQuery(api.events.get);
  const createEvent = useMutation(api.events.create);

  const handleCreateEvent = async () => {
    try {
      await createEvent({
        title,
        description,
        date,
        startTime,
        endTime,
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: theme.palette.background.default,
          borderRadius: 2
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 300 }}>
            Events
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}
            >
              New Event
            </Button>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gap: 2 }}>
        {events?.map((event) => (
          <Paper
            key={event._id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.date}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {event.startTime} - {event.endTime}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {event.description}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          Create New Event
          <IconButton 
            onClick={() => setOpen(false)}
            size="small"
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              label="Start Time"
              type="time"
              fullWidth
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense"
              label="End Time"
              type="time"
              fullWidth
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ 
              textTransform: "none",
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateEvent}
            variant="contained"
            disabled={!title || !description || !date || !startTime || !endTime}
            sx={{ 
              textTransform: "none",
              px: 3,
              borderRadius: 2
            }}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
