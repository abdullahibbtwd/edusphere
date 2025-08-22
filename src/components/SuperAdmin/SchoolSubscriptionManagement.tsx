'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';

// Dummy data
const schools = [
  { id: 1, name: 'Sunrise Academy', status: 'pending', subscription: false },
  { id: 2, name: 'Bright Future College', status: 'active', subscription: true },
  { id: 3, name: 'Green Valley School', status: 'pending', subscription: false },
];

const steps = [
  'Physical Inspection',
  'Secondary School Management Board',
  'Security Inspection',
];

const SchoolSubscriptionManagement = () => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const handleView = (school) => {
    setSelectedSchool(school);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveStep(0);
    setSelectedSchool(null);
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      // Approve school
      alert(`School ${selectedSchool?.name} approved successfully!`);
      handleClose();
    }
  };

  const handleSubscribe = (school) => {
    alert(`Subscribed ${school.name} successfully!`);
  };

  return (
    <Box className="p-6 bg-bg text-text min-h-screen">
      <Typography variant="h4" gutterBottom className="text-primary font-bold">
        School & Subscription Management
      </Typography>

      <Card className="bg-surface shadow-lg rounded-2xl">
        <CardContent>
          <TableContainer component={Paper} className="bg-surface">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="text-primary font-bold">School Name</TableCell>
                  <TableCell className="text-primary font-bold">Status</TableCell>
                  <TableCell className="text-primary font-bold">Subscription</TableCell>
                  <TableCell className="text-primary font-bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.status}</TableCell>
                    <TableCell>{school.subscription ? 'Active' : 'Not Subscribed'}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleView(school)}
                      >
                        View
                      </Button>
                      {!school.subscription && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleSubscribe(school)}
                        >
                          Subscribe
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal for School Details */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle className="text-primary font-bold">
          {selectedSchool?.name} - Details
        </DialogTitle>
        <DialogContent>
          <Typography>Status: {selectedSchool?.status}</Typography>
          <Typography>
            Subscription: {selectedSchool?.subscription ? 'Active' : 'Not Subscribed'}
          </Typography>

          {selectedSchool?.status === 'pending' && (
            <Box className="mt-4">
              <Typography className="mb-2 font-medium">Approval Steps:</Typography>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {selectedSchool?.status === 'pending' && (
            <Button onClick={handleNext} variant="contained" color="primary">
              {activeStep === steps.length - 1 ? 'Approve' : 'Next'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolSubscriptionManagement;
