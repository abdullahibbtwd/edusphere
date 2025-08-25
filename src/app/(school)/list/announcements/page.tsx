"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Chip,
  Stack,
  IconButton,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

export default function AnnouncementsPage() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>(["both"]);

  // Get current user from Convex
  const currentUser = useQuery(api.users.getCurrentUser);
  const isAdmin = currentUser?.role === "admin";
  
  const announcements = useQuery(api.announcements.get, {
    role: currentUser?.role || "student",
  });
  const createAnnouncement = useMutation(api.announcements.create);

  const handleCreateAnnouncement = async () => {
    try {
      await createAnnouncement({
        title,
        content,
        targetRoles,
      });
      setOpen(false);
      setTitle("");
      setContent("");
      setTargetRoles(["both"]);
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleRoleChange = (role: string) => {
    if (role === "both") {
      setTargetRoles(["both"]);
    } else {
      setTargetRoles([role]);
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
            Announcements
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
              New Announcement
            </Button>
          )}
        </Box>
      </Paper>

      <Stack spacing={2}>
        {announcements?.map((announcement) => (
          <Card 
            key={announcement._id}
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              '&:hover': {
                boxShadow: theme.shadows[4],
                transition: 'box-shadow 0.3s ease-in-out'
              }
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {announcement.title}
                </Typography>
                <Chip
                  label={
                    announcement.targetRoles[0] === "both"
                      ? "All Users"
                      : announcement.targetRoles[0]
                  }
                  color="primary"
                  size="small"
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              <Typography
                variant="body1"
                sx={{ 
                  whiteSpace: "pre-wrap", 
                  mb: 2,
                  color: theme.palette.text.secondary
                }}
              >
                {announcement.content}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  mt: 1
                }}
              >
                Posted by {announcement.createdBy?.name} on{" "}
                {new Date(announcement.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

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
          Create New Announcement
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
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend">Target Audience</FormLabel>
            <RadioGroup
              value={targetRoles[0]}
              onChange={(e) => handleRoleChange(e.target.value)}
              sx={{ mt: 1 }}
            >
              <FormControlLabel
                value="both"
                control={<Radio />}
                label="All Users"
              />
              <FormControlLabel
                value="student"
                control={<Radio />}
                label="Students Only"
              />
              <FormControlLabel
                value="teacher"
                control={<Radio />}
                label="Teachers Only"
              />
            </RadioGroup>
          </FormControl>
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
            onClick={handleCreateAnnouncement}
            variant="contained"
            disabled={!title || !content}
            sx={{ 
              textTransform: "none",
              px: 3,
              borderRadius: 2
            }}
          >
            Create Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
